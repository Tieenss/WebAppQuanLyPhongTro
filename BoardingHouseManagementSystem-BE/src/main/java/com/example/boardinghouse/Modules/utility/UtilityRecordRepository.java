package com.example.boardinghouse.Modules.utility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityRecordRepository extends JpaRepository<UtilityRecord, Long> {
    
    Optional<UtilityRecord> findByRoomIdAndRecordDateBetween(Long roomId, LocalDate startDate, LocalDate endDate);
    
    Optional<UtilityRecord> findTopByRoomIdOrderByRecordDateDesc(Long roomId);

    Optional<UtilityRecord> findTopByRoomIdAndRecordDateLessThanOrderByRecordDateDesc(Long roomId, LocalDate recordDate);

    List<UtilityRecord> findByRoomIdOrderByRecordDateDesc(Long roomId);
}
