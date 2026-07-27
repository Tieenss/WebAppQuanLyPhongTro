package com.example.boardinghouse.Modules.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query(value = "SELECT a.* FROM appointments a " +
           "INNER JOIN rooms r ON a.room_id = r.id " +
           "INNER JOIN buildings b ON r.building_id = b.id " +
           "WHERE b.landlord_id = :landlordId", nativeQuery = true)
    List<Appointment> findByLandlordIdNative(@Param("landlordId") Long landlordId);
}
