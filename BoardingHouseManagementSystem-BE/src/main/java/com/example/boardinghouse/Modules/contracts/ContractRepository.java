package com.example.boardinghouse.Modules.contracts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByContractCode(String contractCode);
    boolean existsByContractCode(String contractCode);
    List<Contract> findByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
}
