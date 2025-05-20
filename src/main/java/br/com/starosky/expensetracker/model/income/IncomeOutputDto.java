package br.com.starosky.expensetracker.model.income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.starosky.expensetracker.model.GeneralDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeOutputDto extends GeneralDto {

    private UUID id;
    private String name;
    private BigDecimal value;
    private LocalDate incomeDate;

}
