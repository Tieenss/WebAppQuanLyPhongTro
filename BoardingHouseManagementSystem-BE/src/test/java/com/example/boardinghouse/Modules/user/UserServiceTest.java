package com.example.boardinghouse.Modules.user;

import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.Modules.user.user.UserService;
import com.example.boardinghouse.Modules.user.user.dto.UserRequest;
import com.example.boardinghouse.Modules.user.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetUserById_Success() {
        User mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .fullName("Test User")
                .role("tenant")
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        UserResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("Test User", response.getFullName());
        assertEquals("tenant", response.getRole());
    }

    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(1L));
    }

    @Test
    void testCreateUser() {
        UserRequest request = new UserRequest();
        request.setUsername("newuser");
        request.setPassword("password");
        request.setFullName("New User");
        request.setRole("guest");

        User savedUser = User.builder()
                .id(2L)
                .username("newuser")
                .fullName("New User")
                .role("guest")
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.createUser(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("newuser", response.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
