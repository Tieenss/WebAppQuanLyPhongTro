package com.example.boardinghouse.Modules.invoices;

import com.example.boardinghouse.common.ApiResponse;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceCreateRequest;
import com.example.boardinghouse.Modules.invoices.dto.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@RequestBody InvoiceCreateRequest request) {
        InvoiceResponse response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Invoice created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        
        String userIdStr = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTenant = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TENANT") || a.getAuthority().equals("TENANT"));
                
        List<InvoiceResponse> responses;
        if (isAdmin) {
            responses = invoiceService.getAllInvoices();
        } else if (isTenant) {
            Long tenantId = Long.parseLong(userIdStr);
            responses = invoiceService.getMyInvoices(tenantId);
        } else {
            // Landlord
            responses = invoiceService.getAllInvoices(); 
        }
        
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched invoices successfully"));
    }

    @GetMapping("/my-invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getMyInvoices(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long tenantId = Long.parseLong((String) authentication.getPrincipal());
        List<InvoiceResponse> responses = invoiceService.getMyInvoices(tenantId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched my invoices successfully"));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getInvoicesByContract(@PathVariable Long contractId) {
        List<InvoiceResponse> responses = invoiceService.getInvoicesByContract(contractId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched invoices successfully"));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceResponse>> payInvoice(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String paymentImageUrl = body.get("paymentImageUrl");
        InvoiceResponse response = invoiceService.payInvoice(id, paymentImageUrl);
        return ResponseEntity.ok(ApiResponse.success(response, "Invoice paid successfully"));
    }

    @PutMapping("/{id}/tenant-pay")
    public ResponseEntity<ApiResponse<InvoiceResponse>> tenantPayInvoice(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String paymentImageUrl = body.get("paymentImageUrl");
        InvoiceResponse response = invoiceService.tenantSubmitReceipt(id, paymentImageUrl);
        return ResponseEntity.ok(ApiResponse.success(response, "Receipt submitted successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<InvoiceResponse>> rejectInvoiceReceipt(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.rejectReceipt(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Receipt rejected successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Invoice deleted successfully"));
    }
}
