package com.example.boardinghouse.Modules.utility;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "electricity_index", nullable = false)
    private Integer electricityIndex;

    @Column(name = "water_index", nullable = false)
    private Integer waterIndex;

    @Column(name = "electricity_image", length = 500)
    private String electricityImage;

    @Column(name = "water_image", length = 500)
    private String waterImage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
