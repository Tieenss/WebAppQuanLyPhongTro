package com.example.boardinghouse.Modules.invoices;

import com.example.boardinghouse.Modules.contracts.Contract;
import com.example.boardinghouse.Modules.contracts.ContractRepository;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceCreateRequest;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceResponse;
import com.example.boardinghouse.Modules.utility.UtilityRecord;
import com.example.boardinghouse.Modules.utility.UtilityRecordRepository;
import com.example.boardinghouse.Modules.user.bankaccount.BankAccount;
import com.example.boardinghouse.Modules.user.bankaccount.BankAccountRepository;
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
    private final BankAccountRepository bankAccountRepository;

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
        BigDecimal electricityCost = request.getElectricityUnitPrice().multiply(BigDecimal.valueOf(electricityUsage));
        BigDecimal waterCost = request.getWaterUnitPrice().multiply(BigDecimal.valueOf(waterUsage));

        // Total = roomPrice + electricityPrice + waterPrice + servicePrice + internetPrice + cleaningPrice + parkingPrice + otherPrice + debt - discount
        BigDecimal totalAmount = contract.getRentalPrice()
                .add(electricityCost)
                .add(waterCost)
                .add(request.getServicePrice() != null ? request.getServicePrice() : BigDecimal.ZERO)
                .add(request.getInternetPrice() != null ? request.getInternetPrice() : BigDecimal.ZERO)
                .add(request.getCleaningPrice() != null ? request.getCleaningPrice() : BigDecimal.ZERO)
                .add(request.getParkingPrice() != null ? request.getParkingPrice() : BigDecimal.ZERO)
                .add(request.getOtherPrice() != null ? request.getOtherPrice() : BigDecimal.ZERO)
                .add(request.getDebtFromPreviousMonth() != null ? request.getDebtFromPreviousMonth() : BigDecimal.ZERO)
                .subtract(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);

        // Create Entity
        Invoice invoice = Invoice.builder()
                .contractId(contract.getId())
                .utilityRecordId(request.getUtilityRecordId())
                .bankAccountId(request.getBankAccountId())
                .invoiceCode("INV-" + System.currentTimeMillis())
                .roomPrice(contract.getRentalPrice())
                .electricityPrice(electricityCost)
                .waterPrice(waterCost)
                .servicePrice(request.getServicePrice() != null ? request.getServicePrice() : BigDecimal.ZERO)
                .internetPrice(request.getInternetPrice() != null ? request.getInternetPrice() : BigDecimal.ZERO)
                .cleaningPrice(request.getCleaningPrice() != null ? request.getCleaningPrice() : BigDecimal.ZERO)
                .parkingPrice(request.getParkingPrice() != null ? request.getParkingPrice() : BigDecimal.ZERO)
                .otherPrice(request.getOtherPrice() != null ? request.getOtherPrice() : BigDecimal.ZERO)
                .debtFromPreviousMonth(request.getDebtFromPreviousMonth() != null ? request.getDebtFromPreviousMonth() : BigDecimal.ZERO)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
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

    public void deleteInvoice(Long invoiceId) {
        if (!invoiceRepository.existsById(invoiceId)) {
            throw new RuntimeException("Invoice not found with ID: " + invoiceId);
        }
        invoiceRepository.deleteById(invoiceId);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse.InvoiceResponseBuilder builder = InvoiceResponse.builder()
                .id(invoice.getId())
                .contractId(invoice.getContractId())
                .utilityRecordId(invoice.getUtilityRecordId())
                .invoiceCode(invoice.getInvoiceCode())
                .roomPrice(invoice.getRoomPrice())
                .electricityPrice(invoice.getElectricityPrice())
                .waterPrice(invoice.getWaterPrice())
                .servicePrice(invoice.getServicePrice())
                .internetPrice(invoice.getInternetPrice())
                .cleaningPrice(invoice.getCleaningPrice())
                .parkingPrice(invoice.getParkingPrice())
                .otherPrice(invoice.getOtherPrice())
                .debtFromPreviousMonth(invoice.getDebtFromPreviousMonth())
                .discount(invoice.getDiscount())
                .totalAmount(invoice.getTotalAmount())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .paymentImageUrl(invoice.getPaymentImageUrl())
                .createdAt(invoice.getCreatedAt());

        if (invoice.getBankAccountId() != null) {
            bankAccountRepository.findById(invoice.getBankAccountId()).ifPresent(bank -> {
                builder.bankAccountId(bank.getId());
                builder.bankName(bank.getBankName());
                builder.bankCode(bank.getBankCode());
                builder.bankAccountNumber(bank.getAccountNumber());
                builder.bankAccountHolder(bank.getAccountHolder());
            });
        }

        return builder.build();
    }
}
