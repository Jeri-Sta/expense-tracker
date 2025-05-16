package br.com.starosky.expensetracker.model.expense;

import br.com.starosky.expensetracker.model.card.CardInputDto;
import br.com.starosky.expensetracker.model.category.CategoryInputDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseInputDto {
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
