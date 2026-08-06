package com.example.boardinghouse.Modules.profile.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
