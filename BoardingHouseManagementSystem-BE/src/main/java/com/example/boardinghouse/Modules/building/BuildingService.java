package com.example.boardinghouse.Modules.building;

import com.example.boardinghouse.Modules.building.dto.BuildingRequest;
import com.example.boardinghouse.Modules.building.dto.BuildingResponse;
import com.example.boardinghouse.Modules.activitylog.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final ActivityLogService activityLogService;

    @Autowired
    public BuildingService(BuildingRepository buildingRepository, ActivityLogService activityLogService) {
        this.buildingRepository = buildingRepository;
        this.activityLogService = activityLogService;
    }

    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<BuildingResponse> getBuildingById(Long id) {
        return buildingRepository.findById(id).map(this::mapToResponse);
    }

    public List<BuildingResponse> getBuildingsByLandlordId(Long landlordId) {
        return buildingRepository.findByLandlordId(landlordId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BuildingResponse createBuilding(BuildingRequest request) {
        Building building = Building.builder()
                .landlordId(request.getLandlordId())
                .name(request.getName())
                .address(request.getAddress())
                .imageUrl(request.getImageUrl())
                .amenities(request.getAmenities())
                .build();
        
        Building savedBuilding = buildingRepository.save(building);
        
        activityLogService.logActivity(savedBuilding.getLandlordId(), "CREATE", "BUILDING", "Đã thêm mới tòa nhà: " + savedBuilding.getName());
        
        return mapToResponse(savedBuilding);
    }

    public BuildingResponse updateBuilding(Long id, BuildingRequest request) {
        return buildingRepository.findById(id).map(building -> {
            building.setName(request.getName());
            building.setAddress(request.getAddress());
            building.setImageUrl(request.getImageUrl());
            building.setAmenities(request.getAmenities());
            building.setLandlordId(request.getLandlordId());
            
            Building updatedBuilding = buildingRepository.save(building);
            
            activityLogService.logActivity(updatedBuilding.getLandlordId(), "UPDATE", "BUILDING", "Đã cập nhật tòa nhà: " + updatedBuilding.getName());
            
            return mapToResponse(updatedBuilding);
        }).orElseThrow(() -> new RuntimeException("Building not found with id " + id));
    }

    public void deleteBuilding(Long id) {
        buildingRepository.findById(id).ifPresent(building -> {
            buildingRepository.deleteById(id);
            activityLogService.logActivity(building.getLandlordId(), "DELETE", "BUILDING", "Đã xóa tòa nhà: " + building.getName());
        });
    }

    private BuildingResponse mapToResponse(Building building) {
        return BuildingResponse.builder()
                .id(building.getId())
                .landlordId(building.getLandlordId())
                .name(building.getName())
                .address(building.getAddress())
                .imageUrl(building.getImageUrl())
                .amenities(building.getAmenities())
                .build();
    }
}
