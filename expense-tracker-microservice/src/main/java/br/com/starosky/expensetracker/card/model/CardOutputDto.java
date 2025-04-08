package br.com.starosky.expensetracker.card.model;

import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CardOutputDto {

    private UUID id;
    private BigDecimal limit = BigDecimal.ZERO;
    private int closingDay = 2;
    private BankOutputDto bank = new BankOutputDto();

}
