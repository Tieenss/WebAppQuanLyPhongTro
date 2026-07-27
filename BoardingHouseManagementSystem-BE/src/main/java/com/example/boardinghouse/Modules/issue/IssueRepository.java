package com.example.boardinghouse.Modules.issue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByTenantId(Long tenantId);
    List<Issue> findByStatus(String status);
    List<Issue> findByRoomId(Long roomId);
    List<Issue> findByTenantIdAndStatus(Long tenantId, String status);
    List<Issue> findByTenantIdAndRoomId(Long tenantId, Long roomId);
    List<Issue> findByTenantIdAndStatusAndRoomId(Long tenantId, String status, Long roomId);
    List<Issue> findByStatusAndRoomId(String status, Long roomId);
}
