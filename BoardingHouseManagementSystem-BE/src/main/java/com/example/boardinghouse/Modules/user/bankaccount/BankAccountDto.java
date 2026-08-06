package com.example.boardinghouse.Modules.user.bankaccount;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BankAccountDto {
    private Long id;
    private String bankName;
    private String bankCode;
    private String accountNumber;
    private String accountHolder;
    private Boolean isDefault;
}
