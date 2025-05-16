package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.model.income.IncomeEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepositoryCustom {
    List<IncomeEntity> findByIncomeDate(LocalDate startDate, LocalDate endDate);

    BigDecimal sumMonthIncomes(LocalDate startDate, LocalDate endDate);
}
