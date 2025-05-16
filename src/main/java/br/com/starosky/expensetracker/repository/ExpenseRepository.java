package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.ScopedRepository;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExpenseRepository extends ScopedRepository<ExpenseEntity, UUID>, ExpenseRepositoryCustom {
}
