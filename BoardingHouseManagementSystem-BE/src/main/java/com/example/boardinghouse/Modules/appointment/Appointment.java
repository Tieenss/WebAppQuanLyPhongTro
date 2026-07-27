package com.example.boardinghouse.Modules.appointment;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_id")
    private Long guestId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "appointment_date")
    private LocalDateTime appointmentDate;

    @Column(length = 20)
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
