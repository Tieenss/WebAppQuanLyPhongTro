package com.example.boardinghouse.Modules.invoices;

import com.example.boardinghouse.Modules.contracts.Contract;
import com.example.boardinghouse.Modules.contracts.ContractRepository;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceCreateRequest;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceResponse;
import com.example.boardinghouse.Modules.utility.UtilityRecord;
import com.example.boardinghouse.Modules.utility.UtilityRecordRepository;
import com.example.boardinghouse.Modules.user.bankaccount.BankAccount;
import com.example.boardinghouse.Modules.user.bankaccount.BankAccountRepository;
import com.example.boardinghouse.Modules.notification.event.NotificationEvent;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;

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

        int oldElectricity = 0;
        int oldWater = 0;
        int electricityUsage = currentUtilityRecord.getElectricityIndex();
        int waterUsage = currentUtilityRecord.getWaterIndex();

        if (previousUtilityRecordOpt.isPresent()) {
            UtilityRecord prev = previousUtilityRecordOpt.get();
            oldElectricity = prev.getElectricityIndex();
            oldWater = prev.getWaterIndex();
            electricityUsage = Math.max(0, currentUtilityRecord.getElectricityIndex() - oldElectricity);
            waterUsage = Math.max(0, currentUtilityRecord.getWaterIndex() - oldWater);
        }

        // Calculate Amounts
        BigDecimal electricityCost = request.getElectricityUnitPrice().multiply(BigDecimal.valueOf(electricityUsage));
        BigDecimal waterCost = request.getWaterUnitPrice().multiply(BigDecimal.valueOf(waterUsage));

        BigDecimal serviceCost = request.getServiceUnitPrice() != null && request.getServiceQuantity() != null ? 
            request.getServiceUnitPrice().multiply(BigDecimal.valueOf(request.getServiceQuantity())) : 
            (request.getServicePrice() != null ? request.getServicePrice() : BigDecimal.ZERO);
            
        BigDecimal internetCost = request.getInternetUnitPrice() != null && request.getInternetQuantity() != null ? 
            request.getInternetUnitPrice().multiply(BigDecimal.valueOf(request.getInternetQuantity())) : 
            (request.getInternetPrice() != null ? request.getInternetPrice() : BigDecimal.ZERO);
            
        BigDecimal cleaningCost = request.getCleaningUnitPrice() != null && request.getCleaningQuantity() != null ? 
            request.getCleaningUnitPrice().multiply(BigDecimal.valueOf(request.getCleaningQuantity())) : 
            (request.getCleaningPrice() != null ? request.getCleaningPrice() : BigDecimal.ZERO);
            
        BigDecimal parkingCost = request.getParkingUnitPrice() != null && request.getParkingQuantity() != null ? 
            request.getParkingUnitPrice().multiply(BigDecimal.valueOf(request.getParkingQuantity())) : 
            (request.getParkingPrice() != null ? request.getParkingPrice() : BigDecimal.ZERO);

        // Total = roomPrice + electricityPrice + waterPrice + servicePrice + internetPrice + cleaningPrice + parkingPrice + otherPrice + debt - discount
        BigDecimal totalAmount = contract.getRentalPrice()
                .add(electricityCost)
                .add(waterCost)
                .add(serviceCost)
                .add(internetCost)
                .add(cleaningCost)
                .add(parkingCost)
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
                .oldElectricityIndex(oldElectricity)
                .newElectricityIndex(currentUtilityRecord.getElectricityIndex())
                .electricityUsage(electricityUsage)
                .electricityUnitPrice(request.getElectricityUnitPrice())
                .waterPrice(waterCost)
                .oldWaterIndex(oldWater)
                .newWaterIndex(currentUtilityRecord.getWaterIndex())
                .waterUsage(waterUsage)
                .waterUnitPrice(request.getWaterUnitPrice())
                .servicePrice(serviceCost)
                .serviceQuantity(request.getServiceQuantity() != null ? request.getServiceQuantity() : 1)
                .serviceUnitPrice(request.getServiceUnitPrice())
                .internetPrice(internetCost)
                .internetQuantity(request.getInternetQuantity() != null ? request.getInternetQuantity() : 1)
                .internetUnitPrice(request.getInternetUnitPrice())
                .cleaningPrice(cleaningCost)
                .cleaningQuantity(request.getCleaningQuantity() != null ? request.getCleaningQuantity() : 1)
                .cleaningUnitPrice(request.getCleaningUnitPrice())
                .parkingPrice(parkingCost)
                .parkingQuantity(request.getParkingQuantity() != null ? request.getParkingQuantity() : 0)
                .parkingUnitPrice(request.getParkingUnitPrice())
                .otherPrice(request.getOtherPrice() != null ? request.getOtherPrice() : BigDecimal.ZERO)
                .debtFromPreviousMonth(request.getDebtFromPreviousMonth() != null ? request.getDebtFromPreviousMonth() : BigDecimal.ZERO)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .dueDate(request.getDueDate())
                .status(Invoice.InvoiceStatus.PENDING)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Phát event tạo thông báo cho Khách thuê
        if (contract.getTenant() != null) {
            String title = "Hoá đơn mới";
            String content = "Chủ trọ vừa tạo hoá đơn mới cho phòng " + contract.getRoom().getRoomNumber() + " (Mã HĐ: " + savedInvoice.getInvoiceCode() + "). Vui lòng kiểm tra và thanh toán.";
            eventPublisher.publishEvent(new NotificationEvent(this, contract.getRoom().getBuilding().getLandlordId(), contract.getTenant().getId(), NotificationEvent.TargetType.USER, title, content));
        }

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
    
    public List<InvoiceResponse> getMyInvoices(Long tenantId) {
        List<Long> contractIds = contractRepository.findByTenantId(tenantId).stream()
                .map(Contract::getId)
                .collect(Collectors.toList());
                
        if (contractIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        return invoiceRepository.findByContractIdIn(contractIds).stream()
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

    public InvoiceResponse tenantSubmitReceipt(Long invoiceId, String paymentImageUrl) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        invoice.setStatus(Invoice.InvoiceStatus.PENDING); // Giữ PENDING, nhưng cập nhật ảnh
        invoice.setPaymentImageUrl(paymentImageUrl);
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    public InvoiceResponse rejectReceipt(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        invoice.setStatus(Invoice.InvoiceStatus.PENDING); // Trở về trạng thái chờ thanh toán
        invoice.setPaymentImageUrl(null);
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    public void deleteInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        
        invoiceRepository.deleteById(invoiceId);
        
        if (invoice.getUtilityRecordId() != null) {
            utilityRecordRepository.deleteById(invoice.getUtilityRecordId());
        }
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse.InvoiceResponseBuilder builder = InvoiceResponse.builder()
                .id(invoice.getId())
                .contractId(invoice.getContractId())
                .utilityRecordId(invoice.getUtilityRecordId())
                .invoiceCode(invoice.getInvoiceCode())
                .roomPrice(invoice.getRoomPrice())
                .electricityPrice(invoice.getElectricityPrice())
                .oldElectricityIndex(invoice.getOldElectricityIndex())
                .newElectricityIndex(invoice.getNewElectricityIndex())
                .electricityUsage(invoice.getElectricityUsage())
                .electricityUnitPrice(invoice.getElectricityUnitPrice())
                .waterPrice(invoice.getWaterPrice())
                .oldWaterIndex(invoice.getOldWaterIndex())
                .newWaterIndex(invoice.getNewWaterIndex())
                .waterUsage(invoice.getWaterUsage())
                .waterUnitPrice(invoice.getWaterUnitPrice())
                .servicePrice(invoice.getServicePrice())
                .serviceQuantity(invoice.getServiceQuantity())
                .serviceUnitPrice(invoice.getServiceUnitPrice())
                .internetPrice(invoice.getInternetPrice())
                .internetQuantity(invoice.getInternetQuantity())
                .internetUnitPrice(invoice.getInternetUnitPrice())
                .cleaningPrice(invoice.getCleaningPrice())
                .cleaningQuantity(invoice.getCleaningQuantity())
                .cleaningUnitPrice(invoice.getCleaningUnitPrice())
                .parkingPrice(invoice.getParkingPrice())
                .parkingQuantity(invoice.getParkingQuantity())
                .parkingUnitPrice(invoice.getParkingUnitPrice())
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
