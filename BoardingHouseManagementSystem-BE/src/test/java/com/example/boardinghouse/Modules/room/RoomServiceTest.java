package com.example.boardinghouse.Modules.room;

import com.example.boardinghouse.Modules.building.Building;
import com.example.boardinghouse.Modules.building.BuildingRepository;
import com.example.boardinghouse.Modules.room.dto.RoomRequest;
import com.example.boardinghouse.Modules.room.dto.RoomResponse;
import com.example.boardinghouse.common.FileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BuildingRepository buildingRepository;
    
    @Mock
    private RoomImageRepository roomImageRepository;
    
    @Mock
    private FileUploadService fileUploadService;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRoomById_Success() {
        Building building = Building.builder().id(1L).name("Building A").build();
        Room room = Room.builder()
                .id(100L)
                .building(building)
                .roomNumber("101")
                .price(new BigDecimal("2000000"))
                .area(20.0)
                .status("available")
                .build();

        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(roomImageRepository.findByRoomId(100L)).thenReturn(Collections.emptyList());

        RoomResponse response = roomService.getRoomById(100L);

        assertNotNull(response);
        assertEquals("101", response.getRoomNumber());
        assertEquals("Building A", response.getBuildingName());
        assertEquals(0, response.getImageUrls().size());
    }

    @Test
    void testCreateRoom_BuildingNotFound() {
        RoomRequest request = new RoomRequest();
        request.setBuildingId(99L);
        
        when(buildingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> roomService.createRoom(request));
    }
}
