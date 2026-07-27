package com.example.boardinghouse.security;

import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/token/{userId}")
    public ResponseEntity<String> generateMockToken(@PathVariable String userId) {
        try {
            Long id = Long.parseLong(userId);
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found in DB");
            }
            
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(token);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid userId format");
        }
    }
}
