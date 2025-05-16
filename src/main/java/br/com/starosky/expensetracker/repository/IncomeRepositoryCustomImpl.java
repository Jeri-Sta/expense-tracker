package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.UserScopedQueryService;
import br.com.starosky.expensetracker.model.income.IncomeEntity;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class IncomeRepositoryCustomImpl implements IncomeRepositoryCustom {

    @Autowired
    UserScopedQueryService userScopedQueryService;

    @Override
    public List<IncomeEntity> findByIncomeDate(LocalDate startDate, LocalDate endDate) {
        Specification<IncomeEntity> where = SpecificationBuilder.where(
                List.of(
                        SpecificationBuilder.betweenDates("incomeDate", startDate, endDate),
                        SpecificationBuilder.orderBy("incomeDate", false)
                )
        );
        return userScopedQueryService.findAll(where, IncomeEntity.class);
    }

    @Override
    public BigDecimal sumMonthIncomes(LocalDate startDate, LocalDate endDate) {
        Specification<IncomeEntity> where = SpecificationBuilder.betweenDates("incomeDate", startDate, endDate);
        return userScopedQueryService.sum(where, "value", IncomeEntity.class);
    }
}
