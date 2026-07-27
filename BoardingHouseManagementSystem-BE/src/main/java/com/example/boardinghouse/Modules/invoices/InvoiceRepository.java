package com.example.boardinghouse.Modules.invoices;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsByUtilityRecordId(Long utilityRecordId);

    List<Invoice> findByStatus(Invoice.InvoiceStatus status);

    List<Invoice> findByContractId(Long contractId);
}
