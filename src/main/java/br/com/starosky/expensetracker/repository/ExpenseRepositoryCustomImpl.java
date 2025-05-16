package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.UserScopedQueryService;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ExpenseRepositoryCustomImpl implements ExpenseRepositoryCustom {

    @Autowired
    UserScopedQueryService userScopedQueryService;

    @Override
    public List<ExpenseEntity> findByCardExpense(LocalDate startDate, LocalDate endDate, UUID cardId) {
        Specification<ExpenseEntity> condition = (root, query, cb) -> {
            // Evita problemas com COUNT em paginação
            if (query.getResultType() != Long.class) {
                root.fetch("installmentsRegisters", JoinType.LEFT);
                root.fetch("card", JoinType.INNER);
            }

            // JOINs para acesso aos atributos
            Join<ExpenseEntity, InstallmentEntity> installmentsJoin = root.join("installmentsRegisters", JoinType.LEFT);
            Join<ExpenseEntity, CardEntity> cardJoin = root.join("card", JoinType.INNER);

            // Filtros de data
            Predicate expenseDatePredicate = cb.between(root.get("expenseDate"), startDate, endDate);
            Predicate installmentDatePredicate = cb.between(installmentsJoin.get("installmentDate"), startDate, endDate);

            // Filtro por Card ID
            Predicate cardIdPredicate = cb.equal(cardJoin.get("id"), cardId);

            // Combinando tudo
            Predicate finalPredicate = cb.and(
                    cb.or(expenseDatePredicate, installmentDatePredicate),
                    cardIdPredicate
            );

            // Ordenação (somente se for consulta normal, não count)
            if (query.getResultType() != Long.class) {
                query.orderBy(cb.desc(root.get("expenseDate")));
            }

            return finalPredicate;
        };
        return userScopedQueryService.findAll(condition, ExpenseEntity.class);
    }

    @Override
    public List<ExpenseEntity> findByExpenseDate(LocalDate startDate, LocalDate endDate) {
        List<Specification<ExpenseEntity>> predicates = List.of(
                SpecificationBuilder.betweenDates("expenseDate", startDate, endDate),
                SpecificationBuilder.isNull("card"),
                SpecificationBuilder.orderBy("expenseDate", false)
        );
        return userScopedQueryService.findAll(SpecificationBuilder.where(predicates), ExpenseEntity.class);
    }

    @Override
    public BigDecimal sumCardMonthExpenses(LocalDate startDate, LocalDate endDate, UUID cardId) {
        Specification<ExpenseEntity> where = SpecificationBuilder.where(
                List.of(
                        SpecificationBuilder.join("card", JoinType.INNER, "id", cardId),
                        SpecificationBuilder.betweenDates("expenseDate", startDate, endDate),
                        SpecificationBuilder.equalsTo("installments", 1)
                )
        );

        return userScopedQueryService.sum(where, "value", ExpenseEntity.class);
    }

    @Override
    public BigDecimal sumMonthExpenses(LocalDate startDate, LocalDate endDate) {
        Specification<ExpenseEntity> where = SpecificationBuilder.where(
                List.of(
                        SpecificationBuilder.betweenDates("expenseDate", startDate, endDate),
                        SpecificationBuilder.isNull("card")
                )
        );

        return userScopedQueryService.sum(where, "value", ExpenseEntity.class);
    }
}
