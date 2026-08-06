package com.example.boardinghouse.Modules.activitylog;

import com.example.boardinghouse.Modules.activitylog.dto.ActivityLogResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void logActivity(Long landlordId, String actionType, String entityType, String description) {
        ActivityLog log = ActivityLog.builder()
                .landlordId(landlordId)
                .actionType(actionType)
                .entityType(entityType)
                .description(description)
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLogResponse> getRecentActivities(Long landlordId, int limit, boolean isAdmin) {
        List<ActivityLog> logs;
        if (isAdmin) {
            logs = activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        } else {
            logs = activityLogRepository.findByLandlordIdOrderByCreatedAtDesc(landlordId, PageRequest.of(0, limit));
        }
        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .landlordId(log.getLandlordId())
                .actionType(log.getActionType())
                .entityType(log.getEntityType())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
