package com.example.boardinghouse.Modules.appointment.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;
    private String guestName;
    private String guestPhone;
    private Long roomId;
    private LocalDateTime appointmentDate;
    private String status;
    private String note;
    private LocalDateTime createdAt;
}
