package com.example.boardinghouse.Modules.issue.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateIssueRequest {

    @NotBlank(message = "status cannot be blank")
    private String status;

    private Long assigneeId;
}
