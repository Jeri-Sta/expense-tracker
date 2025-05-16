package br.com.starosky.expensetracker.model.income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeInputDto {

    private UUID id;
    @NotBlank
    private String name;
    @NotNull
    private BigDecimal value;
    @NotNull
    private LocalDate incomeDate;

}
