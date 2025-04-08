package br.com.starosky.expensetracker.resume.service;

import br.com.starosky.expensetracker.expense.service.ExpenseService;
import br.com.starosky.expensetracker.income.service.IncomeService;
import br.com.starosky.expensetracker.installment.service.InstallmentService;
import br.com.starosky.expensetracker.resume.model.ResumeInputDto;
import br.com.starosky.expensetracker.resume.model.ResumeOutputDto;
import lombok.AccessLevel;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class ResumeService {

    ExpenseService expenseService;
    IncomeService incomeService;
    InstallmentService installmentService;

    public ResumeOutputDto getResume(ResumeInputDto dto) {
        BigDecimal totalExpense = expenseService.getMonthTotalExpenses(dto.getCurrentDate());
        BigDecimal totalIncome = incomeService.getMonthTotalIncomes(dto.getCurrentDate());
        BigDecimal totalInstallment = installmentService.sumMonthInstallment(dto.getCurrentDate());

        return new ResumeOutputDto(totalIncome.subtract((totalExpense.add(totalInstallment))), totalIncome,
                totalExpense.add(totalInstallment));
    }
}