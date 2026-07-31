package com.example.boardinghouse.Modules.user.bankaccount;

import com.example.boardinghouse.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {
    private final BankAccountService bankAccountService;

    @GetMapping
    public ResponseEntity<List<BankAccountDto>> getMyBankAccounts() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(bankAccountService.getMyBankAccounts(userId));
    }

    @PostMapping
    public ResponseEntity<BankAccountDto> addBankAccount(@RequestBody BankAccountDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(bankAccountService.addBankAccount(userId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccountDto> updateBankAccount(
            @PathVariable Long id,
            @RequestBody BankAccountDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(bankAccountService.updateBankAccount(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        bankAccountService.deleteBankAccount(userId, id);
        return ResponseEntity.ok().build();
    }
}
