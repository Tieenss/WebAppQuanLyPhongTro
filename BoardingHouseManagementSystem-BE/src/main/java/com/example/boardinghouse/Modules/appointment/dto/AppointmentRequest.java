package com.example.boardinghouse.Modules.appointment.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private String fullName;
    private String phone;
    private Long roomId;
    private LocalDateTime appointmentDate;
    private String note;
}
