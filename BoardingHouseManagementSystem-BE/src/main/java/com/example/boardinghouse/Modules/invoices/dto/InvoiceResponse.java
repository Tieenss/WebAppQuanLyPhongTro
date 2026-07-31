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
    private BigDecimal waterPrice;
    private BigDecimal servicePrice;
    private BigDecimal internetPrice;
    private BigDecimal cleaningPrice;
    private BigDecimal parkingPrice;
    private BigDecimal otherPrice;
    private BigDecimal debtFromPreviousMonth;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private Invoice.InvoiceStatus status;
    private String paymentImageUrl;
    private LocalDateTime createdAt;
}
