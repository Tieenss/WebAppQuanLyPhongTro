package com.example.boardinghouse.Modules.issue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long tenantId;
    private String tenantName;
    private String issueType;
    private String description;
    private String imageUrl;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime resolvedAt;
}
