package com.example.boardinghouse.Modules.invoices.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceCreateRequest {
    private Long contractId;
    private Long utilityRecordId;
    private Long bankAccountId;
    
    private BigDecimal roomPrice;
    
    // Đơn giá / số điện
    private BigDecimal electricityUnitPrice;
    
    // Đơn giá / khối nước
    private BigDecimal waterUnitPrice;
    
    // Phí dịch vụ khác (rác, wifi...)
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
    
    // Hạn thanh toán
    private LocalDate dueDate;
}
