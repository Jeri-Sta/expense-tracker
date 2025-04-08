package br.com.starosky.expensetracker.bank.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankOutputDto {

    private UUID id;
    private String name;
    private BigDecimal balance;
}
