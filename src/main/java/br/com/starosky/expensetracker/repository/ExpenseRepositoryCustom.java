package br.com.starosky.expensetracker.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;

public interface ExpenseRepositoryCustom {
    List<ExpenseEntity> findByCardExpense(LocalDate startDate, LocalDate endDate, UUID cardId);
    List<ExpenseEntity> findByExpenseDate(LocalDate startDate, LocalDate endDate);
    BigDecimal sumCardMonthExpenses(LocalDate startDate, LocalDate endDate, UUID cardId);
    BigDecimal sumMonthExpenses(LocalDate startDate, LocalDate endDate);
}
