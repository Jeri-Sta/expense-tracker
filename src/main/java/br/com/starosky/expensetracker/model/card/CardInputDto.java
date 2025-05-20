package br.com.starosky.expensetracker.model.card;

import br.com.starosky.expensetracker.model.GeneralDto;
import br.com.starosky.expensetracker.model.bank.BankInputDto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class CardInputDto extends GeneralDto {

    private UUID id;
    @NotNull
    private BigDecimal limit = BigDecimal.ZERO;
    @NotNull
    private int closingDay = 2;
    @NotNull
    private BankInputDto bank = new BankInputDto();
}
