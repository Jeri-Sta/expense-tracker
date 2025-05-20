package br.com.starosky.expensetracker.model.card;

import br.com.starosky.expensetracker.model.GeneralDto;
import br.com.starosky.expensetracker.model.bank.BankOutputDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class CardOutputDto extends GeneralDto {

    private UUID id;
    private BigDecimal limit = BigDecimal.ZERO;
    private int closingDay = 2;
    private BankOutputDto bank = new BankOutputDto();
}
