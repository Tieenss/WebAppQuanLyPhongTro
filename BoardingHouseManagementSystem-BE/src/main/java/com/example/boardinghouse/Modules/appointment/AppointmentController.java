package com.example.boardinghouse.Modules.appointment;

import com.example.boardinghouse.common.ApiResponse;
import com.example.boardinghouse.Modules.appointment.dto.AppointmentRequest;
import com.example.boardinghouse.Modules.appointment.dto.AppointmentResponse;
import com.example.boardinghouse.Modules.appointment.dto.AppointmentStatusUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Public API for guests to book an appointment
    @PostMapping("/public")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Appointment booked successfully"));
    }

    // Secured API for landlord to get their appointments
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments() {
        List<AppointmentResponse> responses = appointmentService.getAppointmentsByLandlord();
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched appointments successfully"));
    }

    // Secured API for landlord to update appointment status
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody AppointmentStatusUpdateRequest request) {
        AppointmentResponse response = appointmentService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment status updated successfully"));
    }
}
