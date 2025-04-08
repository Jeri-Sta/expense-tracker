package br.com.starosky.expensetracker.installment.repository;

import br.com.starosky.expensetracker.installment.model.InstallmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface InstallmentRepository extends JpaRepository<InstallmentEntity, UUID> {

    void deleteAllByExpenseId(UUID expenseId);

    @Query("SELECT COALESCE(SUM(i.value), 0) FROM InstallmentEntity i LEFT JOIN i.card c " +
            "WHERE i.installmentDate BETWEEN :startDate AND :endDate " +
            "AND c.id = :cardId")
    BigDecimal sumMonthInstallment(LocalDate startDate, LocalDate endDate, UUID cardId);
}