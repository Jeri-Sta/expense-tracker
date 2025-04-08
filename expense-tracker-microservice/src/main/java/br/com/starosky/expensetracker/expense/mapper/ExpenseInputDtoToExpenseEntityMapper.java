package br.com.starosky.expensetracker.expense.mapper;

import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseInputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class ExpenseInputDtoToExpenseEntityMapper implements Mapper<ExpenseInputDto, ExpenseEntity> {

    @Override
    public ExpenseEntity mapNonNull(ExpenseInputDto input) {
        ExpenseEntity expenseEntity = new ExpenseEntity();
        expenseEntity.setId(input.getId());
        expenseEntity.setName(input.getName());
        expenseEntity.setValue(input.getValue());
        expenseEntity.setExpenseDate(input.getExpenseDate());
        expenseEntity.setInstallments(input.getInstallments());

        CardEntity cardEntity = null;
        if (input.getCard() != null) {
            cardEntity = new CardEntity();
            cardEntity.setId(input.getCard().getId());
        }
        expenseEntity.setCard(cardEntity);

        CategoryEntity categoryEntity = null;
        if (input.getCategory() != null) {
            categoryEntity = new CategoryEntity();
            categoryEntity.setId(input.getCategory().getId());
        }
        expenseEntity.setCategory(categoryEntity);

        return expenseEntity;
    }
}
