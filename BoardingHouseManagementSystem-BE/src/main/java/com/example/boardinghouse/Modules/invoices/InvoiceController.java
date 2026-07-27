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
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> responses = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched invoices successfully"));
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
}
