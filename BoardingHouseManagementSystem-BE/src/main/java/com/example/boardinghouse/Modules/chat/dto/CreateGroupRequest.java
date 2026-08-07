package com.example.boardinghouse.Modules.chat.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateGroupRequest {
    private String chatName;
    private String chatImage;
    private List<Long> memberIds;
}
