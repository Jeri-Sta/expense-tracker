package br.com.starosky.expensetracker.income.repository;

import br.com.starosky.expensetracker.income.model.IncomeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface IncomeRepository extends JpaRepository<IncomeEntity, UUID> {

    @Query("SELECT COALESCE(SUM(i.value), 0) FROM IncomeEntity i " +
            "WHERE i.incomeDate BETWEEN :startDate AND :endDate")
    BigDecimal sumMonthIncomes(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM IncomeEntity i " +
            "WHERE i.incomeDate BETWEEN :startDate AND :endDate " +
            "ORDER BY i.incomeDate DESC")
    List<IncomeEntity> findByIncomeDate(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
