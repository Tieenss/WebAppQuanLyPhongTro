package com.example.boardinghouse.security;

import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.security.dto.LoginRequest;
import com.example.boardinghouse.security.dto.LoginResponse;
import com.example.boardinghouse.security.dto.RegisterRequest;
import com.example.boardinghouse.security.dto.ForgotPasswordRequest;
import com.example.boardinghouse.security.dto.ResetPasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    
    // In-memory OTP storage for demonstration
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getIdentifier() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Identifier and password must be provided.");
        }

        String identifier = loginRequest.getIdentifier();
        
        // Search user by email first, then by phone, then by username
        Optional<User> userOptional = userRepository.findByEmail(identifier);
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByPhone(identifier);
        }
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByUsername(identifier);
        }

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản không tồn tại.");
        }

        User user = userOptional.get();

        // Check password (support both BCrypt and plain text for legacy admin)
        boolean passwordMatch = false;
        if (user.getPassword() != null && user.getPassword().startsWith("$2a$")) {
            passwordMatch = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        } else {
            passwordMatch = loginRequest.getPassword().equals(user.getPassword());
        }

        if (!passwordMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không chính xác.");
        }

        // Generate token
        String token = jwtService.generateToken(user);

        // Build response
        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhone())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(token)
                .user(userDto)
                .build();

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Validate
        if (registerRequest.getUsername() == null || registerRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }
        
        // Check if username exists
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại.");
        }
        
        // Check if phone exists (if provided)
        if (registerRequest.getPhone() != null && !registerRequest.getPhone().isEmpty()) {
            if (userRepository.findByPhone(registerRequest.getPhone()).isPresent()) {
                return ResponseEntity.badRequest().body("Số điện thoại đã được sử dụng.");
            }
        }
        
        // Check if email exists (if provided)
        if (registerRequest.getEmail() != null && !registerRequest.getEmail().isEmpty()) {
            if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email đã được sử dụng.");
            }
        }

        // Create new user
        User newUser = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName() != null ? registerRequest.getFullName() : registerRequest.getUsername())
                .phone(registerRequest.getPhone())
                .email(registerRequest.getEmail())
                .role("LANDLORD")
                .build();
                
        User savedUser = userRepository.save(newUser);

        // Generate token for auto-login
        String token = jwtService.generateToken(savedUser);

        // Build response
        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .phoneNumber(savedUser.getPhone())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(token)
                .user(userDto)
                .build();

        return ResponseEntity.ok(loginResponse);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getIdentifier() == null) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp Tên đăng nhập, Email hoặc Số điện thoại.");
        }
        
        String identifier = request.getIdentifier();
        Optional<User> userOptional = userRepository.findByEmail(identifier);
        if (userOptional.isEmpty()) userOptional = userRepository.findByPhone(identifier);
        if (userOptional.isEmpty()) userOptional = userRepository.findByUsername(identifier);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại.");
        }
        
        // Generate a 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Save in memory mapping identifier -> OTP
        otpStorage.put(identifier, otp);
        
        // In real app, we would send Email or SMS here.
        // For development, we return it in response to easily test.
        return ResponseEntity.ok(Map.of(
            "message", "Mã xác nhận đã được gửi thành công.",
            "mockOtp", otp
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getIdentifier() == null || request.getOtp() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Thiếu thông tin yêu cầu.");
        }
        
        String storedOtp = otpStorage.get(request.getIdentifier());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã xác nhận không chính xác hoặc đã hết hạn.");
        }
        
        Optional<User> userOptional = userRepository.findByEmail(request.getIdentifier());
        if (userOptional.isEmpty()) userOptional = userRepository.findByPhone(request.getIdentifier());
        if (userOptional.isEmpty()) userOptional = userRepository.findByUsername(request.getIdentifier());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại.");
        }
        
        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Clear OTP
        otpStorage.remove(request.getIdentifier());
        
        return ResponseEntity.ok("Mật khẩu đã được cập nhật thành công.");
    }
}
