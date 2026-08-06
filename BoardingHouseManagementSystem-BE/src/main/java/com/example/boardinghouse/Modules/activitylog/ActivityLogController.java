package com.example.boardinghouse.Modules.activitylog;

import com.example.boardinghouse.Modules.activitylog.dto.ActivityLogResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @Autowired
    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogResponse>> getRecentActivities(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long landlordId = Long.parseLong((String) authentication.getPrincipal());
            boolean isAdmin = com.example.boardinghouse.security.SecurityUtils.isAdmin();
            return ResponseEntity.ok(activityLogService.getRecentActivities(landlordId, limit, isAdmin));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
