package com.example.boardinghouse.Modules.building;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    // Tìm các tòa nhà theo chủ trọ (landlord)
    List<Building> findByLandlordId(Long landlordId);

}
