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

    @Column(name = "bank_account_id")
    private Long bankAccountId;

    @Column(name = "invoice_code", nullable = false, length = 100)
    private String invoiceCode;

    @Column(name = "room_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal roomPrice;

    @Column(name = "electricity_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal electricityPrice;

    @Column(name = "old_electricity_index")
    private Integer oldElectricityIndex;

    @Column(name = "new_electricity_index")
    private Integer newElectricityIndex;

    @Column(name = "electricity_usage")
    private Integer electricityUsage;

    @Column(name = "electricity_unit_price", precision = 15, scale = 2)
    private BigDecimal electricityUnitPrice;

    @Column(name = "water_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal waterPrice;

    @Column(name = "old_water_index")
    private Integer oldWaterIndex;

    @Column(name = "new_water_index")
    private Integer newWaterIndex;

    @Column(name = "water_usage")
    private Integer waterUsage;

    @Column(name = "water_unit_price", precision = 15, scale = 2)
    private BigDecimal waterUnitPrice;

    @Column(name = "service_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal servicePrice;

    @Column(name = "service_quantity")
    @Builder.Default
    private Integer serviceQuantity = 1;

    @Column(name = "service_unit_price", precision = 15, scale = 2)
    private BigDecimal serviceUnitPrice;

    @Column(name = "internet_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal internetPrice = BigDecimal.ZERO;

    @Column(name = "internet_quantity")
    @Builder.Default
    private Integer internetQuantity = 1;

    @Column(name = "internet_unit_price", precision = 15, scale = 2)
    private BigDecimal internetUnitPrice;

    @Column(name = "cleaning_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal cleaningPrice = BigDecimal.ZERO;

    @Column(name = "cleaning_quantity")
    @Builder.Default
    private Integer cleaningQuantity = 1;

    @Column(name = "cleaning_unit_price", precision = 15, scale = 2)
    private BigDecimal cleaningUnitPrice;

    @Column(name = "parking_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal parkingPrice = BigDecimal.ZERO;

    @Column(name = "parking_quantity")
    @Builder.Default
    private Integer parkingQuantity = 0;

    @Column(name = "parking_unit_price", precision = 15, scale = 2)
    private BigDecimal parkingUnitPrice;

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
