package com.example.boardinghouse.Modules.utility;

import com.example.boardinghouse.Modules.room.RoomRepository;
import com.example.boardinghouse.Modules.utility.dto.UtilityRecordRequest;
import com.example.boardinghouse.Modules.utility.dto.UtilityRecordResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilityRecordService {

    private final UtilityRecordRepository utilityRecordRepository;
    private final RoomRepository roomRepository;

    public UtilityRecordResponse createUtilityRecord(UtilityRecordRequest request) {
        // Validate room exists
        roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));

        // Check for duplicates in the same month
        YearMonth yearMonth = YearMonth.from(request.getRecordDate());
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        Optional<UtilityRecord> existingRecord = utilityRecordRepository
                .findByRoomIdAndRecordDateBetween(request.getRoomId(), startDate, endDate);

        if (existingRecord.isPresent()) {
            throw new RuntimeException("Utility record already exists for this room in the selected month.");
        }

        UtilityRecord record = UtilityRecord.builder()
                .roomId(request.getRoomId())
                .recordDate(request.getRecordDate())
                .electricityIndex(request.getElectricityIndex())
                .waterIndex(request.getWaterIndex())
                .electricityImage(request.getElectricityImage())
                .waterImage(request.getWaterImage())
                .build();

        UtilityRecord savedRecord = utilityRecordRepository.save(record);

        return mapToResponse(savedRecord);
    }

    public List<UtilityRecordResponse> getUtilityRecordsByRoom(Long roomId) {
        return utilityRecordRepository.findByRoomIdOrderByRecordDateDesc(roomId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UtilityRecordResponse mapToResponse(UtilityRecord record) {
        return UtilityRecordResponse.builder()
                .id(record.getId())
                .roomId(record.getRoomId())
                .recordDate(record.getRecordDate())
                .electricityIndex(record.getElectricityIndex())
                .waterIndex(record.getWaterIndex())
                .electricityImage(record.getElectricityImage())
                .waterImage(record.getWaterImage())
                .build();
    }
}
