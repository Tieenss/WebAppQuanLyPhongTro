package com.example.boardinghouse.Modules.appointment;

import com.example.boardinghouse.Modules.appointment.dto.AppointmentRequest;
import com.example.boardinghouse.Modules.appointment.dto.AppointmentResponse;
import com.example.boardinghouse.Modules.appointment.dto.AppointmentStatusUpdateRequest;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        // 1. Find if guest user already exists by phone
        User guest = userRepository.findByPhone(request.getPhone()).orElse(null);
        
        // 2. If not, create a new User with role GUEST
        if (guest == null) {
            guest = User.builder()
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .username(request.getPhone()) // Generate username from phone to avoid null constraint
                    .password("guest123") // Default password for guest
                    .role("guest")
                    .build();
            guest = userRepository.save(guest);
        } else if (!"guest".equals(guest.getRole())) {
            // Existing user is not a guest, but let's allow them to book anyway
            // Just update their name if they want, but better leave it.
        }
        
        // 3. Create appointment
        Appointment appointment = Appointment.builder()
                .guestId(guest.getId())
                .roomId(request.getRoomId())
                .appointmentDate(request.getAppointmentDate() != null ? request.getAppointmentDate() : LocalDateTime.now().plusDays(1))
                .status("PENDING")
                .note(request.getNote())
                .build();
                
        appointment = appointmentRepository.save(appointment);
        
        return mapToResponse(appointment, guest);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByLandlord() {
        Long landlordId = SecurityUtils.getCurrentUserId();
        
        if (landlordId == null) {
            throw new RuntimeException("User not authenticated");
        }

        List<Appointment> appointments = appointmentRepository.findByLandlordIdNative(landlordId);
        
        return appointments.stream().map(app -> {
            User guest = userRepository.findById(app.getGuestId()).orElse(null);
            return mapToResponse(app, guest);
        }).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest request) {
        Long landlordId = SecurityUtils.getCurrentUserId();
        
        // Ensure landlord owns this appointment (Ideally check the query, but for simplicity we assume the landlord knows the ID, or we fetch their list and check)
        List<Appointment> myAppointments = appointmentRepository.findByLandlordIdNative(landlordId);
        boolean owns = myAppointments.stream().anyMatch(a -> a.getId().equals(id));
        
        if (!owns) {
            throw new RuntimeException("Appointment not found or access denied");
        }

        Appointment appointment = appointmentRepository.findById(id).orElseThrow();
        appointment.setStatus(request.getStatus());
        appointment = appointmentRepository.save(appointment);
        
        User guest = userRepository.findById(appointment.getGuestId()).orElse(null);
        return mapToResponse(appointment, guest);
    }

    private AppointmentResponse mapToResponse(Appointment appointment, User guest) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .guestName(guest != null ? guest.getFullName() : null)
                .guestPhone(guest != null ? guest.getPhone() : null)
                .roomId(appointment.getRoomId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .note(appointment.getNote())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
