package com.example.boardinghouse.Modules.user.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải có đúng 10 chữ số")
    private String phone;

    @Email(message = "Email should be valid")
    private String email;

    private String role;

    private String avatarUrl;
}
