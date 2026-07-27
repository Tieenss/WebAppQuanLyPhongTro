package com.example.boardinghouse.Modules.utility.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UtilityRecordResponse {
    private Long id;
    private Long roomId;
    private LocalDate recordDate;
    private Integer electricityIndex;
    private Integer waterIndex;
    private String electricityImage;
    private String waterImage;
}
