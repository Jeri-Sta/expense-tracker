package br.com.starosky.expensetracker.model.expense;

import br.com.starosky.expensetracker.model.GeneralDto;
import br.com.starosky.expensetracker.model.card.CardInputDto;
import br.com.starosky.expensetracker.model.category.CategoryInputDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ExpenseInputDto extends GeneralDto {
    private UUID id;
    @NotBlank
    private String name;
    private CategoryInputDto category;
    private CardInputDto card;
    @NotNull
    private BigDecimal value;
    @NotNull
    private LocalDate expenseDate;
    private Integer installments;

    public ExpenseInputDto() {
        this.value = BigDecimal.ZERO;
        this.expenseDate = LocalDate.now();
        this.installments = 1;
    }
}
