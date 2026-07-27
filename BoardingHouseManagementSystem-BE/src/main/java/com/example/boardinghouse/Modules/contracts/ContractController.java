package com.example.boardinghouse.Modules.contracts;

import com.example.boardinghouse.Modules.contracts.dto.ContractRequest;
import com.example.boardinghouse.Modules.contracts.dto.ContractResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts() {
        return ResponseEntity.ok(contractService.getAllContracts());
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
