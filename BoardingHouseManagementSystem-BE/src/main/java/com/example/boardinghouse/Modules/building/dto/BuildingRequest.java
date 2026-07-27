package com.example.boardinghouse.Modules.building.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BuildingRequest {
    @NotNull(message = "Landlord ID is required")
    private Long landlordId;

    @NotBlank(message = "Building name is required")
    private String name;

    @NotBlank(message = "Building address is required")
    private String address;

    private String imageUrl;
    
    private String amenities;
}
