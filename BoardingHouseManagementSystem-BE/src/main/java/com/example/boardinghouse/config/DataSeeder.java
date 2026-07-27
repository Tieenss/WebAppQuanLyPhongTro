package com.example.boardinghouse.config;

import com.example.boardinghouse.Modules.building.Building;
import com.example.boardinghouse.Modules.building.BuildingRepository;
import com.example.boardinghouse.Modules.room.Room;
import com.example.boardinghouse.Modules.room.RoomRepository;
import com.example.boardinghouse.Modules.subscription.SubscriptionPackage;
import com.example.boardinghouse.Modules.subscription.SubscriptionPackageRepository;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionPackageRepository subscriptionPackageRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public DataSeeder(UserRepository userRepository, 
                      SubscriptionPackageRepository subscriptionPackageRepository,
                      BuildingRepository buildingRepository,
                      RoomRepository roomRepository) {
        this.userRepository = userRepository;
        this.subscriptionPackageRepository = subscriptionPackageRepository;
        this.buildingRepository = buildingRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        User landlord = seedMockUsers();
        seedSubscriptionPackages();
        seedMockBuildingsAndRooms(landlord);
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("System Administrator")
                    .email("admin@gmail.com")
                    .role("admin") 
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded Admin user: admin / 123456");
        }
    }

    private User seedMockUsers() {
        User landlord = userRepository.findByUsername("chutro").orElse(null);
        if (landlord == null) {
            landlord = User.builder()
                    .username("chutro")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Nguyễn Văn Chủ Trọ")
                    .phone("0987654321")
                    .email("chutro@gmail.com")
                    .role("landlord")
                    .build();
            landlord = userRepository.save(landlord);
            System.out.println("Seeded Landlord: chutro / 123456");
        }

        if (userRepository.findByUsername("khachthue").isEmpty()) {
            User tenant = User.builder()
                    .username("khachthue")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Trần Thị Khách Thuê")
                    .phone("0123456789")
                    .email("khachthue@gmail.com")
                    .role("tenant")
                    .landlord(landlord)
                    .build();
            userRepository.save(tenant);
            System.out.println("Seeded Tenant: khachthue / 123456");
        }
        
        return landlord;
    }

    private void seedSubscriptionPackages() {
        if (subscriptionPackageRepository.findByName("Gói Miễn phí").isEmpty()) {
            SubscriptionPackage freePackage = SubscriptionPackage.builder()
                    .name("Gói Miễn phí")
                    .price(BigDecimal.ZERO)
                    .maxRooms(5)
                    .durationMonths(120) // 10 năm
                    .description("Gói trải nghiệm cho người mới bắt đầu (Tối đa 5 phòng).")
                    .build();
            subscriptionPackageRepository.save(freePackage);
        }

        if (subscriptionPackageRepository.findByName("Gói Pro").isEmpty()) {
            SubscriptionPackage proPackage = SubscriptionPackage.builder()
                    .name("Gói Pro")
                    .price(new BigDecimal("199000"))
                    .maxRooms(9999)
                    .durationMonths(1)
                    .description("Gói chuyên nghiệp không giới hạn phòng (199k/tháng).")
                    .build();
            subscriptionPackageRepository.save(proPackage);
        }
    }

    private void seedMockBuildingsAndRooms(User landlord) {
        if (landlord != null && buildingRepository.findByLandlordId(landlord.getId()).isEmpty()) {
            Building building1 = Building.builder()
                    .landlordId(landlord.getId())
                    .name("Chung cư mini Hoa Hồng")
                    .address("Số 10, Ngõ 20, Quận Cầu Giấy, Hà Nội")
                    .amenities("Wifi miễn phí, Máy giặt chung, Chỗ để xe rộng rãi")
                    .build();
            building1 = buildingRepository.save(building1);
            System.out.println("Seeded Building: " + building1.getName());

            Room room1 = Room.builder()
                    .building(building1)
                    .roomNumber("P101")
                    .price(new BigDecimal("2500000"))
                    .area(20.5)
                    .maxOccupants(2)
                    .status("rented")
                    .description("Phòng tầng 1, thoáng mát, có cửa sổ.")
                    .amenities("Điều hòa, Nóng lạnh, Giường, Tủ")
                    .build();

            Room room2 = Room.builder()
                    .building(building1)
                    .roomNumber("P102")
                    .price(new BigDecimal("3000000"))
                    .area(25.0)
                    .maxOccupants(3)
                    .status("available")
                    .description("Phòng rộng, phù hợp ở nhóm.")
                    .amenities("Điều hòa, Nóng lạnh, Tủ lạnh nhỏ")
                    .build();
            
            Room room3 = Room.builder()
                    .building(building1)
                    .roomNumber("P201")
                    .price(new BigDecimal("2800000"))
                    .area(22.0)
                    .maxOccupants(2)
                    .status("available")
                    .description("Phòng tầng 2, có ban công phơi đồ.")
                    .amenities("Điều hòa, Nóng lạnh, Bàn làm việc")
                    .build();

            roomRepository.save(room1);
            roomRepository.save(room2);
            roomRepository.save(room3);
            System.out.println("Seeded 3 Mock Rooms for Building " + building1.getName());
        }
    }
}
