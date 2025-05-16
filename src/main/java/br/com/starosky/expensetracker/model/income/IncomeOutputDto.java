package br.com.starosky.expensetracker.model.income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeOutputDto {

    private UUID id;
    private String name;
    private BigDecimal value;
    private LocalDate incomeDate;

}
