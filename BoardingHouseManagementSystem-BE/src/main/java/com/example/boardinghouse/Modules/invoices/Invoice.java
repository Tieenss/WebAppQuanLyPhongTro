package com.example.boardinghouse.Modules.invoices;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    public enum InvoiceStatus {
        PENDING,
        PAID,
        OVERDUE,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "utility_record_id", nullable = false)
    private Long utilityRecordId;

    @Column(name = "invoice_code", nullable = false, length = 100)
    private String invoiceCode;

    @Column(name = "room_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal roomPrice;

    @Column(name = "electricity_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal electricityPrice;

    @Column(name = "water_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal waterPrice;

    @Column(name = "service_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal servicePrice;

    @Column(name = "internet_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal internetPrice = BigDecimal.ZERO;

    @Column(name = "cleaning_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal cleaningPrice = BigDecimal.ZERO;

    @Column(name = "parking_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal parkingPrice = BigDecimal.ZERO;

    @Column(name = "other_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal otherPrice = BigDecimal.ZERO;

    @Column(name = "debt_from_previous_month", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debtFromPreviousMonth = BigDecimal.ZERO;

    @Column(name = "discount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(name = "payment_image_url", length = 500)
    private String paymentImageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
