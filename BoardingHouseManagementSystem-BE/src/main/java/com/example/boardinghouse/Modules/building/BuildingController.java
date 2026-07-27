package com.example.boardinghouse.Modules.building;

import com.example.boardinghouse.Modules.building.dto.BuildingRequest;
import com.example.boardinghouse.Modules.building.dto.BuildingResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingService buildingService;

    @Autowired
    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAllBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponse> getBuildingById(@PathVariable Long id) {
        return buildingService.getBuildingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<BuildingResponse>> getBuildingsByLandlordId(@PathVariable Long landlordId) {
        return ResponseEntity.ok(buildingService.getBuildingsByLandlordId(landlordId));
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> createBuilding(@Valid @RequestBody BuildingRequest request) {
        BuildingResponse createdBuilding = buildingService.createBuilding(request);
        return new ResponseEntity<>(createdBuilding, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> updateBuilding(@PathVariable Long id, @Valid @RequestBody BuildingRequest request) {
        try {
            BuildingResponse updatedBuilding = buildingService.updateBuilding(id, request);
            return ResponseEntity.ok(updatedBuilding);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}
