package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import br.com.starosky.expensetracker.repository.InstallmentRepository;
import lombok.AccessLevel;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class InstallmentService {

    InstallmentRepository repository;
    CardService cardService;

    public void calculateInstallments(ExpenseEntity expenseEntity) {
        if (expenseEntity.getInstallments() <= 1) {
            return;
        }

        if (expenseEntity.getId() != null) {
            repository.deleteByExpenseId(expenseEntity.getId());
        }

        BigDecimal installmentsValue = expenseEntity.getValue()
                .divide(BigDecimal.valueOf(expenseEntity.getInstallments()), 2, RoundingMode.HALF_UP);
        var installmentList = new ArrayList<InstallmentEntity>();

        for (int i = 1; i <= expenseEntity.getInstallments(); i++) {
            LocalDate date = (i == 1) ? expenseEntity.getExpenseDate()
                    : expenseEntity.getExpenseDate().plusMonths(i - 1L);
            InstallmentEntity installmentEntity = new InstallmentEntity();
            installmentEntity.setInstallmentNumber(i);
            installmentEntity.setInstallmentDate(date);
            installmentEntity.setValue(installmentsValue);
            installmentEntity.setExpense(expenseEntity);
            installmentEntity.setCard(expenseEntity.getCard());
            installmentList.add(installmentEntity);
        }

        expenseEntity.setInstallmentsRegisters(installmentList);
    }

    public BigDecimal sumMonthInstallment(LocalDate referenceDate) {
        var cardByClosingDate = cardService.listAll().stream()
                .collect(Collectors.toMap(CardOutputDto::getId, CardOutputDto::getClosingDay));
        BigDecimal total = BigDecimal.ZERO;

        for (var entry : cardByClosingDate.entrySet()) {
            LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(), entry.getValue());
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            total = total.add(repository.sumMonthInstallment(startDate, endDate, entry.getKey()));
        }
        return total;
    }
}
