package com.example.boardinghouse.Modules.issue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequest {

    @NotNull(message = "roomId cannot be null")
    private Long roomId;

    @NotBlank(message = "issueType cannot be blank")
    private String issueType;

    @NotBlank(message = "description cannot be blank")
    private String description;

    private String imageUrl;

    @NotBlank(message = "priority cannot be blank")
    private String priority;
}
