package com.example.boardinghouse.Modules.contracts.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    // Người thuê có thể null nếu tạo hợp đồng cho phòng trống (chưa có người thuê)
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
    @Pattern(regexp = "^\\d{10,12}$", message = "CCCD/CMND chủ trọ phải có từ 10 đến 12 chữ số")
    private String landlordCccd;
    private String landlordCccdPlace;
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại chủ trọ phải có đúng 10 chữ số")
    private String landlordPhone;

    private String tenantName;
    @Pattern(regexp = "^\\d{10,12}$", message = "CCCD/CMND người thuê phải có từ 10 đến 12 chữ số")
    private String tenantCccd;
    private String tenantCccdPlace;
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại người thuê phải có đúng 10 chữ số")
    private String tenantPhone;
}
