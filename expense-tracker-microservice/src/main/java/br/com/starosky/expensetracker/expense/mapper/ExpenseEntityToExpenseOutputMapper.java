package br.com.starosky.expensetracker.expense.mapper;

import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import br.com.starosky.expensetracker.card.model.CardOutputDto;
import br.com.starosky.expensetracker.category.model.CategoryOutputDto;
import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseOutputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import br.com.starosky.expensetracker.installment.model.InstallmentOutputDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExpenseEntityToExpenseOutputMapper implements Mapper<ExpenseEntity, ExpenseOutputDto> {

    @Override
    public ExpenseOutputDto mapNonNull(ExpenseEntity input) {
        BankOutputDto bankDto = null;
        if (input.getCard() != null && input.getCard().getBank() != null) {
            bankDto = new BankOutputDto();
            bankDto.setId(input.getCard().getBank().getId());
            bankDto.setName(input.getCard().getBank().getName());
            bankDto.setBalance(input.getCard().getBank().getBalance());
        }

        CardOutputDto cardDto = null;
        if (input.getCard() != null) {
            cardDto = new CardOutputDto();
            cardDto.setId(input.getCard().getId());
            cardDto.setLimit(input.getCard().getLimit());
            cardDto.setClosingDay(input.getCard().getClosingDay());
            cardDto.setBank(bankDto);
        }

        CategoryOutputDto categoryDto = null;
        if (input.getCategory() != null) {
            categoryDto = new CategoryOutputDto();
            categoryDto.setId(input.getCategory().getId());
            categoryDto.setName(input.getCategory().getName());
            categoryDto.setColor(input.getCategory().getColor());
            categoryDto.setFixedExpense(input.getCategory().isFixedExpense());
        }

        List<InstallmentOutputDto> installmentsRegistersDto = null;
        if (input.getInstallmentsRegisters() != null) {
            installmentsRegistersDto = input.getInstallmentsRegisters().stream().map(installment -> {
                InstallmentOutputDto installmentDto = new InstallmentOutputDto();
                installmentDto.setId(installment.getId());
                installmentDto.setInstallmentNumber(installment.getInstallmentNumber());
                installmentDto.setInstallmentDate(installment.getInstallmentDate());
                installmentDto.setValue(installment.getValue());
                return installmentDto;
            }).toList();
        }

        ExpenseOutputDto expenseOutputDto = new ExpenseOutputDto();
        expenseOutputDto.setId(input.getId());
        expenseOutputDto.setName(input.getName());
        expenseOutputDto.setCategory(categoryDto);
        expenseOutputDto.setCard(cardDto);
        expenseOutputDto.setValue(input.getValue());
        expenseOutputDto.setExpenseDate(input.getExpenseDate());
        expenseOutputDto.setInstallments(input.getInstallments());
        expenseOutputDto.setInstallmentsRegisters(installmentsRegistersDto);

        return expenseOutputDto;
    }
}
