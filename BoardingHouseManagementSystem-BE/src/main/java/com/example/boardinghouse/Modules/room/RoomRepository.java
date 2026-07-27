package com.example.boardinghouse.Modules.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // Tìm các phòng thuộc một tòa nhà cụ thể
    List<Room> findByBuildingId(Long buildingId);

    // Tìm các phòng theo trạng thái để phục vụ bộ lọc của khách xem phòng / admin
    List<Room> findByStatus(String status);
}
