package com.example.boardinghouse.Modules.contracts.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ContractResponse {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long tenantId;
    private String tenantName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal deposit;
    private BigDecimal rentalPrice;
    private String contractPdfUrl;
    private String status;
    private Long appointmentId;
    private LocalDateTime createdAt;
}
