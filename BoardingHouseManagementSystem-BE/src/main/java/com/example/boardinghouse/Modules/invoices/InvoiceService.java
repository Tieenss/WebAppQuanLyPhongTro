package com.example.boardinghouse.Modules.invoices;

import com.example.boardinghouse.Modules.contracts.Contract;
import com.example.boardinghouse.Modules.contracts.ContractRepository;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceCreateRequest;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceResponse;
import com.example.boardinghouse.Modules.utility.UtilityRecord;
import com.example.boardinghouse.Modules.utility.UtilityRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UtilityRecordRepository utilityRecordRepository;
    private final ContractRepository contractRepository;

    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        // Validate Contract
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found with ID: " + request.getContractId()));

        // Validate UtilityRecord
        UtilityRecord currentUtilityRecord = utilityRecordRepository.findById(request.getUtilityRecordId())
                .orElseThrow(() -> new RuntimeException("Utility record not found with ID: " + request.getUtilityRecordId()));

        if (!currentUtilityRecord.getRoomId().equals(contract.getRoom().getId())) {
            throw new RuntimeException("Utility record does not belong to the contract's room.");
        }

        // Prevent Duplicate Invoice
        if (invoiceRepository.existsByUtilityRecordId(request.getUtilityRecordId())) {
            throw new RuntimeException("Invoice already exists for this utility record.");
        }

        // Calculate Usage
        Optional<UtilityRecord> previousUtilityRecordOpt = utilityRecordRepository
                .findTopByRoomIdAndRecordDateLessThanOrderByRecordDateDesc(
                        currentUtilityRecord.getRoomId(), currentUtilityRecord.getRecordDate());

        int electricityUsage = currentUtilityRecord.getElectricityIndex();
        int waterUsage = currentUtilityRecord.getWaterIndex();

        if (previousUtilityRecordOpt.isPresent()) {
            UtilityRecord prev = previousUtilityRecordOpt.get();
            electricityUsage = Math.max(0, currentUtilityRecord.getElectricityIndex() - prev.getElectricityIndex());
            waterUsage = Math.max(0, currentUtilityRecord.getWaterIndex() - prev.getWaterIndex());
        }

        // Calculate Amounts
        BigDecimal electricityPriceTotal = request.getElectricityUnitPrice().multiply(BigDecimal.valueOf(electricityUsage));
        BigDecimal waterPriceTotal = request.getWaterUnitPrice().multiply(BigDecimal.valueOf(waterUsage));
        BigDecimal roomPrice = contract.getRentalPrice();
        BigDecimal servicePrice = request.getServicePrice() != null ? request.getServicePrice() : BigDecimal.ZERO;

        BigDecimal totalAmount = electricityPriceTotal.add(waterPriceTotal).add(roomPrice).add(servicePrice);

        // Generate Invoice Code
        String invoiceCode = "INV-" + contract.getRoom().getId() + "-" + currentUtilityRecord.getRecordDate().getYear() + String.format("%02d", currentUtilityRecord.getRecordDate().getMonthValue());

        // Create Entity
        Invoice invoice = Invoice.builder()
                .contractId(contract.getId())
                .utilityRecordId(currentUtilityRecord.getId())
                .invoiceCode(invoiceCode)
                .roomPrice(roomPrice)
                .electricityPrice(electricityPriceTotal)
                .waterPrice(waterPriceTotal)
                .servicePrice(servicePrice)
                .totalAmount(totalAmount)
                .dueDate(request.getDueDate())
                .status(Invoice.InvoiceStatus.PENDING)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return mapToResponse(savedInvoice);
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InvoiceResponse> getInvoicesByContract(Long contractId) {
        return invoiceRepository.findByContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse payInvoice(Long invoiceId, String paymentImageUrl) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaymentImageUrl(paymentImageUrl);
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .contractId(invoice.getContractId())
                .utilityRecordId(invoice.getUtilityRecordId())
                .invoiceCode(invoice.getInvoiceCode())
                .roomPrice(invoice.getRoomPrice())
                .electricityPrice(invoice.getElectricityPrice())
                .waterPrice(invoice.getWaterPrice())
                .servicePrice(invoice.getServicePrice())
                .totalAmount(invoice.getTotalAmount())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .paymentImageUrl(invoice.getPaymentImageUrl())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
