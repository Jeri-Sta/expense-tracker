package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.ScopedRepository;
import br.com.starosky.expensetracker.model.income.IncomeEntity;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface IncomeRepository extends ScopedRepository<IncomeEntity, UUID>, IncomeRepositoryCustom {
}
