package com.example.boardinghouse.Modules.invoices.dto;

import com.example.boardinghouse.Modules.invoices.Invoice;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private Long contractId;
    private Long utilityRecordId;
    private Long bankAccountId;
    private String bankName;
    private String bankCode;
    private String bankAccountNumber;
    private String bankAccountHolder;
    private String invoiceCode;
    private BigDecimal roomPrice;
    
    private BigDecimal electricityPrice;
    private Integer oldElectricityIndex;
    private Integer newElectricityIndex;
    private Integer electricityUsage;
    private BigDecimal electricityUnitPrice;

    private BigDecimal waterPrice;
    private Integer oldWaterIndex;
    private Integer newWaterIndex;
    private Integer waterUsage;
    private BigDecimal waterUnitPrice;

    private BigDecimal servicePrice;
    private Integer serviceQuantity;
    private BigDecimal serviceUnitPrice;

    private BigDecimal internetPrice;
    private Integer internetQuantity;
    private BigDecimal internetUnitPrice;

    private BigDecimal cleaningPrice;
    private Integer cleaningQuantity;
    private BigDecimal cleaningUnitPrice;

    private BigDecimal parkingPrice;
    private Integer parkingQuantity;
    private BigDecimal parkingUnitPrice;

    private BigDecimal otherPrice;
    private BigDecimal debtFromPreviousMonth;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private Invoice.InvoiceStatus status;
    private String paymentImageUrl;
    private LocalDateTime createdAt;
}
