package com.example.boardinghouse.Modules.utility.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UtilityRecordRequest {
    private Long roomId;
    private LocalDate recordDate;
    private Integer electricityIndex;
    private Integer waterIndex;
    private String electricityImage;
    private String waterImage;
}
