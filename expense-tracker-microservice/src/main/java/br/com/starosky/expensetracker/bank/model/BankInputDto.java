package br.com.starosky.expensetracker.bank.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankInputDto {

    private UUID id;
    @NotBlank
    private String name;
    @NotNull
    private BigDecimal balance;
}
