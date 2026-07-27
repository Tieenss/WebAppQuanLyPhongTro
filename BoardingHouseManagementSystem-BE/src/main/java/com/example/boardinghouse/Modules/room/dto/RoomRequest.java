package com.example.boardinghouse.Modules.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RoomRequest {
    @NotNull(message = "Building ID is required")
    private Long buildingId;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotNull(message = "Area is required")
    private Double area;

    private Integer maxOccupants;
    private String status;
    private String description;
    private String amenities;
}
