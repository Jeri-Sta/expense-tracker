package br.com.starosky.expensetracker.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface InstallmentRepositoryCustom {
    BigDecimal sumMonthInstallment(LocalDate startDate, LocalDate endDate, UUID cardId);

    void deleteByExpenseId(UUID expenseId);
}
