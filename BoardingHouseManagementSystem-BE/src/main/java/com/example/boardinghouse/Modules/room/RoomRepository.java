package com.example.boardinghouse.Modules.room;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @EntityGraph(attributePaths = {"building"})
    List<Room> findAll();

    @EntityGraph(attributePaths = {"building"})
    List<Room> findByBuildingId(Long buildingId);

    @EntityGraph(attributePaths = {"building"})
    List<Room> findByBuildingLandlordId(Long landlordId);

    boolean existsByRoomNumberAndBuildingId(String roomNumber, Long buildingId);
    
    @EntityGraph(attributePaths = {"building"})
    java.util.Optional<Room> findByRoomNumberAndBuildingId(String roomNumber, Long buildingId);

    @EntityGraph(attributePaths = {"building"})
    List<Room> findByStatus(String status);
}
