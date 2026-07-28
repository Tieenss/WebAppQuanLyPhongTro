package com.example.boardinghouse.Modules.contracts;

import com.example.boardinghouse.Modules.contracts.dto.ContractRequest;
import com.example.boardinghouse.Modules.contracts.dto.ContractResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String userIdStr = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
        if (isAdmin) {
            return ResponseEntity.ok(contractService.getAllContracts());
        } else {
            Long landlordId = Long.parseLong(userIdStr);
            return ResponseEntity.ok(contractService.getActiveContractsByLandlordId(landlordId)); // Temporary reuse, ideally separate endpoint for all landlord's contracts
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<ContractResponse>> getActiveContracts(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long landlordId = Long.parseLong((String) authentication.getPrincipal());
        return ResponseEntity.ok(contractService.getActiveContractsByLandlordId(landlordId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContractById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @PostMapping
    public ResponseEntity<ContractResponse> createContract(@Valid @RequestBody ContractRequest request) {
        return ResponseEntity.ok(contractService.createContract(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponse> updateContract(@PathVariable Long id, @Valid @RequestBody ContractRequest request) {
        return ResponseEntity.ok(contractService.updateContract(id, request));
    }

    @PatchMapping("/{id}/terminate")
    public ResponseEntity<ContractResponse> terminateContract(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.terminateContract(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }
}
