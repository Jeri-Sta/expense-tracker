package br.com.starosky.expensetracker.card.model;

import br.com.starosky.expensetracker.bank.model.BankInputDto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CardInputDto {

    private UUID id;
    @NotNull
    private BigDecimal limit = BigDecimal.ZERO;
    @NotNull
    private int closingDay = 2;
    @NotNull
    private BankInputDto bank = new BankInputDto();

}
