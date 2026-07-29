package com.example.boardinghouse.Modules.contracts;

import com.example.boardinghouse.Modules.contracts.dto.ContractRequest;
import com.example.boardinghouse.Modules.contracts.dto.ContractResponse;
import com.example.boardinghouse.Modules.room.Room;
import com.example.boardinghouse.Modules.room.RoomRepository;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.boardinghouse.security.SecurityUtils;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final com.example.boardinghouse.Modules.notification.NotificationService notificationService;

    @Autowired
    public ContractService(ContractRepository contractRepository, RoomRepository roomRepository, UserRepository userRepository, com.example.boardinghouse.Modules.notification.NotificationService notificationService) {
        this.contractRepository = contractRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContractResponse getContractById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        return mapToResponse(contract);
    }

    public List<ContractResponse> getActiveContractsByLandlordId(Long landlordId) {
        if (SecurityUtils.isAdmin()) {
            return contractRepository.findByStatus("active").stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return contractRepository.findByRoomBuildingLandlordIdAndStatus(landlordId, "active").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContractResponse createContract(ContractRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        User tenant = null;
        if (request.getTenantId() != null) {
            tenant = userRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
        }

        // Sinh mã hợp đồng (ví dụ: HD-ROOMID-TIMESTAMP)
        String code = request.getContractCode() != null ? request.getContractCode() : "HD-" + room.getRoomNumber() + "-" + System.currentTimeMillis();

        Contract contract = Contract.builder()
                .contractCode(code)
                .room(room)
                .tenant(tenant)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .deposit(request.getDeposit())
                .rentalPrice(request.getRentalPrice())
                .electricityPrice(request.getElectricityPrice())
                .waterPrice(request.getWaterPrice())
                .wifiPrice(request.getWifiPrice())
                .parkingPrice(request.getParkingPrice())
                .servicePrice(request.getServicePrice())
                .paymentDate(request.getPaymentDate())
                .assets(request.getAssets())
                .contractPdfUrl(request.getContractPdfUrl())
                .terms(request.getTerms())
                .appointmentId(request.getAppointmentId())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .landlordName(request.getLandlordName())
                .landlordCccd(request.getLandlordCccd())
                .landlordCccdPlace(request.getLandlordCccdPlace())
                .landlordPhone(request.getLandlordPhone())
                .tenantName(request.getTenantName())
                .tenantCccd(request.getTenantCccd())
                .tenantCccdPlace(request.getTenantCccdPlace())
                .tenantPhone(request.getTenantPhone())
                .build();

        // Cập nhật trạng thái phòng
        room.setStatus("rented");
        roomRepository.save(room);

        return mapToResponse(contractRepository.save(contract));
    }

    public ContractResponse updateContract(Long id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getRoom().getId().equals(request.getRoomId())) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            contract.setRoom(room);
        }

        if (request.getTenantId() != null) {
            if (contract.getTenant() == null || !contract.getTenant().getId().equals(request.getTenantId())) {
                User tenant = userRepository.findById(request.getTenantId())
                        .orElseThrow(() -> new RuntimeException("Tenant not found"));
                contract.setTenant(tenant);
            }
        } else {
            contract.setTenant(null);
        }


        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDeposit(request.getDeposit());
        contract.setRentalPrice(request.getRentalPrice());
        contract.setElectricityPrice(request.getElectricityPrice());
        contract.setWaterPrice(request.getWaterPrice());
        contract.setWifiPrice(request.getWifiPrice());
        contract.setParkingPrice(request.getParkingPrice());
        contract.setServicePrice(request.getServicePrice());
        contract.setPaymentDate(request.getPaymentDate());
        contract.setAssets(request.getAssets());
        contract.setContractPdfUrl(request.getContractPdfUrl());
        contract.setTerms(request.getTerms());
        contract.setAppointmentId(request.getAppointmentId());
        if (request.getStatus() != null) {
            contract.setStatus(request.getStatus());
        }
        if (request.getContractCode() != null) {
            contract.setContractCode(request.getContractCode());
        }
        
        contract.setLandlordName(request.getLandlordName());
        contract.setLandlordCccd(request.getLandlordCccd());
        contract.setLandlordCccdPlace(request.getLandlordCccdPlace());
        contract.setLandlordPhone(request.getLandlordPhone());
        
        contract.setTenantName(request.getTenantName());
        contract.setTenantCccd(request.getTenantCccd());
        contract.setTenantCccdPlace(request.getTenantCccdPlace());
        contract.setTenantPhone(request.getTenantPhone());

        return mapToResponse(contractRepository.save(contract));
    }

    public ContractResponse terminateContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus("terminated");
        contractRepository.save(contract);

        // Giải phóng phòng
        Room room = contract.getRoom();
        room.setStatus("available");
        roomRepository.save(room);

        return mapToResponse(contract);
    }

    public ContractResponse joinContract(String contractCode, Long userId) {
        Contract contract = contractRepository.findByContractCode(contractCode)
                .orElseThrow(() -> new RuntimeException("Contract code not found or invalid"));

        if (contract.getTenant() != null) {
            throw new RuntimeException("This contract already has a tenant");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("guest".equals(user.getRole())) {
            user.setRole("tenant");
        }

        Room room = contract.getRoom();
        Long landlordId = room.getBuilding().getLandlordId();
        
        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new RuntimeException("Landlord not found"));
        
        user.setLandlord(landlord);
        userRepository.save(user);

        contract.setTenant(user);
        contract = contractRepository.save(contract);

        // Cập nhật trạng thái phòng phòng hờ
        if ("available".equals(room.getStatus())) {
            room.setStatus("rented");
            roomRepository.save(room);
        }

        // Gửi thông báo đẩy cho Chủ trọ
        notificationService.sendToUser(userId, landlordId, "Hợp đồng mới được xác nhận", "Khách " + user.getFullName() + " đã xác nhận và vào ở phòng " + room.getRoomNumber());

        return mapToResponse(contract);
    }

    public void deleteContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        contractRepository.delete(contract);
    }

    private ContractResponse mapToResponse(Contract contract) {
        String displayTenantName = contract.getTenantName();
        if (displayTenantName == null || displayTenantName.trim().isEmpty()) {
            displayTenantName = contract.getTenant() != null ? contract.getTenant().getFullName() : "Trống";
        }

        return ContractResponse.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .roomId(contract.getRoom().getId())
                .roomNumber(contract.getRoom().getRoomNumber())
                .tenantId(contract.getTenant() != null ? contract.getTenant().getId() : null)
                .tenantName(displayTenantName)
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .deposit(contract.getDeposit())
                .rentalPrice(contract.getRentalPrice())
                .electricityPrice(contract.getElectricityPrice())
                .waterPrice(contract.getWaterPrice())
                .wifiPrice(contract.getWifiPrice())
                .parkingPrice(contract.getParkingPrice())
                .servicePrice(contract.getServicePrice())
                .paymentDate(contract.getPaymentDate())
                .assets(contract.getAssets())
                .contractPdfUrl(contract.getContractPdfUrl())
                .terms(contract.getTerms())
                .status(contract.getStatus())
                .appointmentId(contract.getAppointmentId())
                .createdAt(contract.getCreatedAt())
                .landlordName(contract.getLandlordName())
                .landlordCccd(contract.getLandlordCccd())
                .landlordCccdPlace(contract.getLandlordCccdPlace())
                .landlordPhone(contract.getLandlordPhone())
                .tenantCccd(contract.getTenantCccd())
                .tenantCccdPlace(contract.getTenantCccdPlace())
                .tenantPhone(contract.getTenantPhone())
                .build();
    }
}
