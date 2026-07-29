package com.example.boardinghouse.Modules.contracts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    // Tenant có thể null nếu tạo hợp đồng cho phòng trống (chưa có người thuê)
    private Long tenantId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Deposit is required")
    private BigDecimal deposit;

    @NotNull(message = "Rental price is required")
    private BigDecimal rentalPrice;

    private BigDecimal electricityPrice;
    private BigDecimal waterPrice;
    private BigDecimal wifiPrice;
    private BigDecimal parkingPrice;
    private BigDecimal servicePrice;
    private Integer paymentDate;
    private String assets;

    private String terms;
    private String contractPdfUrl;
    private Long appointmentId;
    private String contractCode;
    private String status;

    private String landlordName;
    private String landlordCccd;
    private String landlordCccdPlace;
    private String landlordPhone;

    private String tenantName;
    private String tenantCccd;
    private String tenantCccdPlace;
    private String tenantPhone;
}
