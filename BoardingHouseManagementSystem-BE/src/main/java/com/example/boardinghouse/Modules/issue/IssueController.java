package com.example.boardinghouse.Modules.issue;

import com.example.boardinghouse.Modules.issue.dto.IssueRequest;
import com.example.boardinghouse.Modules.issue.dto.IssueResponse;
import com.example.boardinghouse.Modules.issue.dto.UpdateIssueRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/su-co")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(@Valid @RequestBody IssueRequest request) {
        return ResponseEntity.ok(issueService.createIssue(request));
    }

    @GetMapping
    public ResponseEntity<List<IssueResponse>> getIssues(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long roomId) {
        return ResponseEntity.ok(issueService.getIssues(status, roomId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody UpdateIssueRequest request) {
        return ResponseEntity.ok(issueService.updateIssue(id, request));
    }
}
