package com.example.boardinghouse.Modules.appointment.dto;

import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {
    private String status; // CONFIRMED, CANCELLED, COMPLETED
}
