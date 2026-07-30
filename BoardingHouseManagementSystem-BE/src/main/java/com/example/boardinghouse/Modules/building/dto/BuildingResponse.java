package com.example.boardinghouse.Modules.building.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuildingResponse {
    private Long id;
    private Long landlordId;
    private String name;
    private String address;
    private String imageUrl;
    private String amenities;
    private String owner;
    private Integer totalRooms;
    private String status;
    private String description;
}
