package com.example.boardinghouse.Modules.building;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    // Tìm các tòa nhà theo chủ trọ (landlord)
    List<Building> findByLandlordId(Long landlordId);

    boolean existsByName(String name);
    boolean existsByAddress(String address);

    java.util.Optional<Building> findByName(String name);
    java.util.Optional<Building> findByAddress(String address);

}
