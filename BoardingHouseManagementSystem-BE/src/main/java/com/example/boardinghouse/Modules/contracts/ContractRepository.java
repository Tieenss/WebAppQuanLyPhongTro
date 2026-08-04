package com.example.boardinghouse.Modules.contracts;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
    @EntityGraph(attributePaths = {"room", "tenant"})
    List<Contract> findAll();

    @EntityGraph(attributePaths = {"room", "tenant"})
    Optional<Contract> findByContractCode(String contractCode);
    
    boolean existsByContractCode(String contractCode);
    
    @EntityGraph(attributePaths = {"room", "tenant"})
    List<Contract> findByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
    
    @EntityGraph(attributePaths = {"room", "tenant"})
    List<Contract> findByStatus(String status);
    
    @EntityGraph(attributePaths = {"room", "tenant"})
    List<Contract> findByTenantId(Long tenantId);
}
