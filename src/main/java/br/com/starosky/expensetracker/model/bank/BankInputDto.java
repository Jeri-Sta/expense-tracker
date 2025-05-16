package br.com.starosky.expensetracker.model.bank;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

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
