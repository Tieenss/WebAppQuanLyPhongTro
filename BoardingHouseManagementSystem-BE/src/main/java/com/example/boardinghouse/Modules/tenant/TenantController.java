package com.example.boardinghouse.Modules.tenant;

import com.example.boardinghouse.common.ApiResponse;
import com.example.boardinghouse.Modules.tenant.dto.TenantRequest;
import com.example.boardinghouse.Modules.tenant.dto.TenantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getTenants() {
        List<TenantResponse> responses = tenantService.getTenants();
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched tenants successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantById(@PathVariable Long id) {
        TenantResponse response = tenantService.getTenantById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched tenant successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TenantResponse>> createTenant(@RequestBody TenantRequest request) {
        TenantResponse response = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Tenant created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenant(
            @PathVariable Long id,
            @RequestBody TenantRequest request) {
        TenantResponse response = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tenant updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Tenant deleted successfully"));
    }
}
