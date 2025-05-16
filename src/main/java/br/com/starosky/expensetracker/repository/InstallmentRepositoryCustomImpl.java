package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.UserScopedQueryService;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class InstallmentRepositoryCustomImpl implements InstallmentRepositoryCustom {

    @Autowired
    UserScopedQueryService userScopedQueryService;

    @Override
    public BigDecimal sumMonthInstallment(LocalDate startDate, LocalDate endDate, UUID cardId) {
        Specification<InstallmentEntity> where = SpecificationBuilder.where(
                List.of(
                        SpecificationBuilder.join("card", JoinType.LEFT, "id", cardId),
                        SpecificationBuilder.betweenDates("installmentDate", startDate, endDate)
                )
        );

        return userScopedQueryService.sum(where, "value", InstallmentEntity.class         );
    }

    @Override
    public void deleteByExpenseId(UUID expenseId) {
        userScopedQueryService.delete(SpecificationBuilder.equalsTo("expense", expenseId), InstallmentEntity.class);
    }
}
