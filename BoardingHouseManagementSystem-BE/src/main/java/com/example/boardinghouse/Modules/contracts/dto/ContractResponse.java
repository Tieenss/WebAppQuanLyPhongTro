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
    private BigDecimal electricityPrice;
    private BigDecimal waterPrice;
    private BigDecimal wifiPrice;
    private BigDecimal parkingPrice;
    private BigDecimal servicePrice;
    private Integer paymentDate;
    private String assets;
    private String contractPdfUrl;
    private String contractCode;
    private String terms;
    private String status;
    private Long appointmentId;
    private LocalDateTime createdAt;
    
    private String landlordName;
    private String landlordCccd;
    private String landlordCccdPlace;
    private String landlordPhone;

    private String tenantCccd;
    private String tenantCccdPlace;
    private String tenantPhone;
}
