package com.example.boardinghouse.Modules.user.bankaccount;

import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankAccountService {
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    public List<BankAccountDto> getMyBankAccounts(Long userId) {
        return bankAccountRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BankAccountDto addBankAccount(Long userId, BankAccountDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BankAccount> existing = bankAccountRepository.findByUserId(userId);
        boolean isDefault = dto.getIsDefault() != null ? dto.getIsDefault() : existing.isEmpty();

        if (isDefault) {
            existing.forEach(acc -> {
                acc.setIsDefault(false);
                bankAccountRepository.save(acc);
            });
        }

        BankAccount account = BankAccount.builder()
                .user(user)
                .bankName(dto.getBankName())
                .bankCode(dto.getBankCode())
                .accountNumber(dto.getAccountNumber())
                .accountHolder(dto.getAccountHolder())
                .isDefault(isDefault)
                .build();

        return mapToDto(bankAccountRepository.save(account));
    }

    @Transactional
    public BankAccountDto updateBankAccount(Long userId, Long accountId, BankAccountDto dto) {
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (Boolean.TRUE.equals(dto.getIsDefault()) && !account.getIsDefault()) {
            List<BankAccount> existing = bankAccountRepository.findByUserId(userId);
            existing.forEach(acc -> {
                acc.setIsDefault(false);
                bankAccountRepository.save(acc);
            });
            account.setIsDefault(true);
        }

        if (dto.getBankName() != null) account.setBankName(dto.getBankName());
        if (dto.getBankCode() != null) account.setBankCode(dto.getBankCode());
        if (dto.getAccountNumber() != null) account.setAccountNumber(dto.getAccountNumber());
        if (dto.getAccountHolder() != null) account.setAccountHolder(dto.getAccountHolder());

        return mapToDto(bankAccountRepository.save(account));
    }

    @Transactional
    public void deleteBankAccount(Long userId, Long accountId) {
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        bankAccountRepository.delete(account);
    }

    private BankAccountDto mapToDto(BankAccount account) {
        return BankAccountDto.builder()
                .id(account.getId())
                .bankName(account.getBankName())
                .bankCode(account.getBankCode())
                .accountNumber(account.getAccountNumber())
                .accountHolder(account.getAccountHolder())
                .isDefault(account.getIsDefault())
                .build();
    }
}
