package com.example.boardinghouse.Modules.contracts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Deposit is required")
    private BigDecimal deposit;

    @NotNull(message = "Rental price is required")
    private BigDecimal rentalPrice;

    private String contractPdfUrl;
    private Long appointmentId;
}
