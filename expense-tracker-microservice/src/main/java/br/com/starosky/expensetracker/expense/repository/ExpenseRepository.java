package br.com.starosky.expensetracker.expense.repository;

import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, UUID> {

    @Query("SELECT COALESCE(SUM(e.value), 0) FROM ExpenseEntity e " +
            "WHERE e.expenseDate BETWEEN :startDate AND :endDate " +
            "AND e.card IS NULL")
    BigDecimal sumMonthExpenses(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.value), 0) FROM ExpenseEntity e JOIN e.card c " +
            "WHERE e.expenseDate BETWEEN :startDate AND :endDate " +
            "AND e.installments = 1 AND c.id = :cardId")
    BigDecimal sumCardMonthExpenses(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("cardId") UUID cardId);

    @Query("SELECT e FROM ExpenseEntity e " +
            "WHERE e.expenseDate BETWEEN :startDate AND :endDate AND e.card IS NULL " +
            "ORDER BY e.expenseDate DESC")
    List<ExpenseEntity> findByExpenseDate(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM ExpenseEntity e LEFT JOIN e.installmentsRegisters i RIGHT JOIN e.card c " +
            "WHERE (e.expenseDate BETWEEN :startDate AND :endDate OR i.installmentDate BETWEEN :startDate AND :endDate) "
            +
            "AND c.id = :cardId " +
            "ORDER BY e.expenseDate DESC")
    List<ExpenseEntity> findByCardExpense(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("cardId") UUID cardId);
}
