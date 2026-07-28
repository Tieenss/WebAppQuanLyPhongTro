package com.example.boardinghouse.Modules.activitylog.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ActivityLogResponse {
    private Long id;
    private Long landlordId;
    private String actionType;
    private String entityType;
    private String description;
    private LocalDateTime createdAt;
}
