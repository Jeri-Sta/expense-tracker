package br.com.starosky.expensetracker.model.bank;

import br.com.starosky.expensetracker.model.GeneralDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankOutputDto extends GeneralDto {

    private UUID id;
    private String name;
    private BigDecimal balance;
}