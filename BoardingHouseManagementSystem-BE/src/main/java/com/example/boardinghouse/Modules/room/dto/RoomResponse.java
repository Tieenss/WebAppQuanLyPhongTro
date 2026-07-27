package com.example.boardinghouse.Modules.room.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RoomResponse {
    private Long id;
    private Long buildingId;
    private String buildingName;
    private String roomNumber;
    private BigDecimal price;
    private Double area;
    private Integer maxOccupants;
    private String status;
    private String description;
    private String amenities;
    private LocalDateTime createdAt;
    private java.util.List<String> imageUrls;
}
