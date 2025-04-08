package br.com.starosky.expensetracker.expense.model;

import br.com.starosky.expensetracker.card.model.CardOutputDto;
import br.com.starosky.expensetracker.category.model.CategoryOutputDto;
import br.com.starosky.expensetracker.installment.model.InstallmentOutputDto;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ExpenseOutputDto {
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
