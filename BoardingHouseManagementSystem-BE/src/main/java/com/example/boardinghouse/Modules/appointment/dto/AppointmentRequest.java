package com.example.boardinghouse.Modules.appointment.dto;

import lombok.Data;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private String fullName;
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải có đúng 10 chữ số")
    private String phone;
    private Long roomId;
    private LocalDateTime appointmentDate;
    private String note;
}
