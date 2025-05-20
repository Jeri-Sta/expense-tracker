package br.com.starosky.expensetracker.model.expense;

import br.com.starosky.expensetracker.model.GeneralDto;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.model.category.CategoryOutputDto;
import br.com.starosky.expensetracker.model.installment.InstallmentOutputDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ExpenseOutputDto extends GeneralDto {
    private UUID id;
    private String name;
    private CategoryOutputDto category;
    private CardOutputDto card;
    private BigDecimal value;
    private LocalDate expenseDate;
    private Integer installments;
    private List<InstallmentOutputDto> installmentsRegisters;

    public ExpenseOutputDto() {
        this.value = BigDecimal.ZERO;
        this.expenseDate = LocalDate.now();
        this.installments = 1;
    }
}
