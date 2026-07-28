package com.example.boardinghouse.Modules.room;

import com.example.boardinghouse.Modules.building.Building;
import com.example.boardinghouse.Modules.building.BuildingRepository;
import com.example.boardinghouse.Modules.room.dto.RoomRequest;
import com.example.boardinghouse.Modules.room.dto.RoomResponse;
import com.example.boardinghouse.Modules.activitylog.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.example.boardinghouse.common.FileUploadService;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final RoomImageRepository roomImageRepository;
    private final FileUploadService fileUploadService;
    private final ActivityLogService activityLogService;

    @Autowired
    public RoomService(RoomRepository roomRepository, BuildingRepository buildingRepository, 
                       RoomImageRepository roomImageRepository, FileUploadService fileUploadService,
                       ActivityLogService activityLogService) {
        this.roomRepository = roomRepository;
        this.buildingRepository = buildingRepository;
        this.roomImageRepository = roomImageRepository;
        this.fileUploadService = fileUploadService;
        this.activityLogService = activityLogService;
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByBuilding(Long buildingId) {
        return roomRepository.findByBuildingId(buildingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByLandlordId(Long landlordId) {
        return roomRepository.findByBuildingLandlordId(landlordId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByStatus(String status) {
        return roomRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        return mapToResponse(room);
    }

    public RoomResponse createRoom(RoomRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found"));

        Room room = Room.builder()
                .building(building)
                .roomNumber(request.getRoomNumber())
                .price(request.getPrice())
                .area(request.getArea())
                .maxOccupants(request.getMaxOccupants())
                .status(request.getStatus() != null ? request.getStatus() : "available")
                .description(request.getDescription())
                .amenities(request.getAmenities())
                .build();

        Room savedRoom = roomRepository.save(room);
        
        activityLogService.logActivity(building.getLandlordId(), "CREATE", "ROOM", "Đã thêm mới phòng: " + savedRoom.getRoomNumber() + " (Tòa nhà: " + building.getName() + ")");
        
        return mapToResponse(savedRoom);
    }

    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getBuilding().getId().equals(request.getBuildingId())) {
            Building building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new RuntimeException("Building not found"));
            room.setBuilding(building);
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setPrice(request.getPrice());
        room.setArea(request.getArea());
        room.setMaxOccupants(request.getMaxOccupants());
        room.setStatus(request.getStatus());
        room.setDescription(request.getDescription());
        room.setAmenities(request.getAmenities());

        Room updatedRoom = roomRepository.save(room);
        
        activityLogService.logActivity(updatedRoom.getBuilding().getLandlordId(), "UPDATE", "ROOM", "Đã cập nhật phòng: " + updatedRoom.getRoomNumber() + " (Tòa nhà: " + updatedRoom.getBuilding().getName() + ")");
        
        return mapToResponse(updatedRoom);
    }

    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        roomRepository.delete(room);
        activityLogService.logActivity(room.getBuilding().getLandlordId(), "DELETE", "ROOM", "Đã xóa phòng: " + room.getRoomNumber() + " (Tòa nhà: " + room.getBuilding().getName() + ")");
    }

    public RoomResponse uploadRoomImage(Long roomId, MultipartFile file) throws IOException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        String imageUrl = fileUploadService.uploadImage(file);
        
        RoomImage roomImage = RoomImage.builder()
                .room(room)
                .imageUrl(imageUrl)
                .build();
        roomImageRepository.save(roomImage);
        
        return mapToResponse(room);
    }

    private RoomResponse mapToResponse(Room room) {
        List<String> imageUrls = roomImageRepository.findByRoomId(room.getId())
                .stream()
                .map(RoomImage::getImageUrl)
                .collect(Collectors.toList());

        return RoomResponse.builder()
                .id(room.getId())
                .buildingId(room.getBuilding().getId())
                .buildingName(room.getBuilding().getName())
                .roomNumber(room.getRoomNumber())
                .price(room.getPrice())
                .area(room.getArea())
                .maxOccupants(room.getMaxOccupants())
                .status(room.getStatus())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .createdAt(room.getCreatedAt())
                .imageUrls(imageUrls)
                .build();
    }
}
