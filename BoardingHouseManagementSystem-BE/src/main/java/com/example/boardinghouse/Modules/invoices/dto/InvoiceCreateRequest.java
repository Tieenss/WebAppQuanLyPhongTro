package com.example.boardinghouse.Modules.invoices.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceCreateRequest {
    private Long contractId;
    private Long utilityRecordId;
    
    // Đơn giá / số điện
    private BigDecimal electricityUnitPrice;
    
    // Đơn giá / khối nước
    private BigDecimal waterUnitPrice;
    
    // Phí dịch vụ khác (rác, wifi...)
    private BigDecimal servicePrice;
    
    // Hạn thanh toán
    private LocalDate dueDate;
}
