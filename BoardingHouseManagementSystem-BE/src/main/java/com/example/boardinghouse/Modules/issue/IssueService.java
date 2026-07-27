package com.example.boardinghouse.Modules.issue;

import com.example.boardinghouse.Modules.issue.dto.IssueRequest;
import com.example.boardinghouse.Modules.issue.dto.IssueResponse;
import com.example.boardinghouse.Modules.issue.dto.UpdateIssueRequest;
import com.example.boardinghouse.Modules.room.Room;
import com.example.boardinghouse.Modules.room.RoomRepository;
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
public class IssueService {

    private final IssueRepository issueRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        Long tenantId = SecurityUtils.getCurrentUserId();
        if (tenantId == null) {
            throw new RuntimeException("User is not authenticated");
        }

        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Issue issue = Issue.builder()
                .room(room)
                .tenant(tenant)
                .issueType(request.getIssueType())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .priority(request.getPriority())
                .status("CHO_TIEP_NHAN")
                .build();

        return mapToResponse(issueRepository.save(issue));
    }

    public List<IssueResponse> getIssues(String status, Long roomId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("User is not authenticated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Issue> issues;

        if ("tenant".equalsIgnoreCase(user.getRole())) {
            // Tenant can only see their own issues
            if (status != null && roomId != null) {
                issues = issueRepository.findByTenantIdAndStatusAndRoomId(userId, status, roomId);
            } else if (status != null) {
                issues = issueRepository.findByTenantIdAndStatus(userId, status);
            } else if (roomId != null) {
                issues = issueRepository.findByTenantIdAndRoomId(userId, roomId);
            } else {
                issues = issueRepository.findByTenantId(userId);
            }
        } else {
            // Admin/Landlord/Staff can see all issues
            if (status != null && roomId != null) {
                // Not in repo yet but can be done via stream or adding to repo, adding to repo is better
                // Wait, I didn't add findByStatusAndRoomId to the repository. Let me just use stream for now or add it.
                // I actually added findByStatusAndRoomId to IssueRepository! Let's use it.
                issues = issueRepository.findByStatusAndRoomId(status, roomId);
            } else if (status != null) {
                issues = issueRepository.findByStatus(status);
            } else if (roomId != null) {
                issues = issueRepository.findByRoomId(roomId);
            } else {
                issues = issueRepository.findAll();
            }
        }

        return issues.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public IssueResponse updateIssue(Long id, UpdateIssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issue.setStatus(request.getStatus());
        
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            issue.setAssignee(assignee);
        }

        if ("HOAN_THANH".equalsIgnoreCase(request.getStatus()) && issue.getResolvedAt() == null) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        return mapToResponse(issueRepository.save(issue));
    }

    private IssueResponse mapToResponse(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .roomId(issue.getRoom().getId())
                .roomNumber(issue.getRoom().getRoomNumber())
                .tenantId(issue.getTenant().getId())
                .tenantName(issue.getTenant().getFullName())
                .issueType(issue.getIssueType())
                .description(issue.getDescription())
                .imageUrl(issue.getImageUrl())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .createdAt(issue.getCreatedAt())
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getFullName() : null)
                .resolvedAt(issue.getResolvedAt())
                .build();
    }
}
