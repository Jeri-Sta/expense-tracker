package br.com.starosky.expensetracker.model.income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.starosky.expensetracker.model.GeneralDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class IncomeInputDto extends GeneralDto {

    private UUID id;
    @NotBlank
    private String name;
    @NotNull
    private BigDecimal value;
    @NotNull
    private LocalDate incomeDate;

}
