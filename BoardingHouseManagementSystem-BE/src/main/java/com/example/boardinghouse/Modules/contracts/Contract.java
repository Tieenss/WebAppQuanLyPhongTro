package com.example.boardinghouse.Modules.contracts;

import com.example.boardinghouse.Modules.room.Room;
import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_code", unique = true, length = 50)
    private String contractCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = true)
    private User tenant;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal deposit;

    @Column(name = "rental_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal rentalPrice;

    @Column(name = "electricity_price", precision = 15, scale = 2)
    private BigDecimal electricityPrice;

    @Column(name = "water_price", precision = 15, scale = 2)
    private BigDecimal waterPrice;

    @Column(name = "wifi_price", precision = 15, scale = 2)
    private BigDecimal wifiPrice;

    @Column(name = "parking_price", precision = 15, scale = 2)
    private BigDecimal parkingPrice;

    @Column(name = "service_price", precision = 15, scale = 2)
    private BigDecimal servicePrice;

    @Column(name = "payment_date")
    private Integer paymentDate;

    @Column(name = "landlord_name")
    private String landlordName;

    @Column(name = "landlord_cccd")
    private String landlordCccd;

    @Column(name = "landlord_cccd_place")
    private String landlordCccdPlace;

    @Column(name = "landlord_phone")
    private String landlordPhone;

    @Column(name = "tenant_name")
    private String tenantName;

    @Column(name = "tenant_cccd")
    private String tenantCccd;

    @Column(name = "tenant_cccd_place")
    private String tenantCccdPlace;

    @Column(name = "tenant_phone")
    private String tenantPhone;

    @Column(columnDefinition = "TEXT")
    private String assets;

    @Column(name = "contract_pdf_url", length = 500)
    private String contractPdfUrl;

    @Column(nullable = false)
    @Builder.Default
    private String status = "active"; // đang hoạt động, đã hết hạn, đã chấm dứt
    @Column(name = "appointment_id")
    private Long appointmentId;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime createdAt;
}
