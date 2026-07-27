package com.example.boardinghouse.Modules.utility;

import com.example.boardinghouse.common.ApiResponse;
import com.example.boardinghouse.Modules.utility.dto.UtilityRecordRequest;
import com.example.boardinghouse.Modules.utility.dto.UtilityRecordResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilities")
@RequiredArgsConstructor
public class UtilityRecordController {

    private final UtilityRecordService utilityRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<UtilityRecordResponse>> createUtilityRecord(@RequestBody UtilityRecordRequest request) {
        UtilityRecordResponse response = utilityRecordService.createUtilityRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Utility record created successfully"));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<UtilityRecordResponse>>> getUtilityRecordsByRoom(@PathVariable Long roomId) {
        List<UtilityRecordResponse> responses = utilityRecordService.getUtilityRecordsByRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched utility records successfully"));
    }
}
