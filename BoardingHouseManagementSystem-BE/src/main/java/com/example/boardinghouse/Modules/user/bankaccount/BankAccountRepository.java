package com.example.boardinghouse.Modules.user.bankaccount;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUserId(Long userId);
    List<BankAccount> findByUserIdAndIsDefaultTrue(Long userId);
}
