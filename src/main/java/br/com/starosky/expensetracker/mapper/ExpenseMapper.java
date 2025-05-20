package br.com.starosky.expensetracker.mapper;

import br.com.starosky.expensetracker.model.bank.BankOutputDto;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.model.category.CategoryEntity;
import br.com.starosky.expensetracker.model.category.CategoryOutputDto;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseInputDto;
import br.com.starosky.expensetracker.model.expense.ExpenseOutputDto;
import br.com.starosky.expensetracker.model.installment.InstallmentOutputDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExpenseMapper implements Mapper<ExpenseEntity, ExpenseInputDto, ExpenseOutputDto> {

    @Override
    public ExpenseOutputDto toDto(ExpenseEntity input) {
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
        expenseOutputDto.setCreatedAt(input.getCreatedAt());
        expenseOutputDto.setUpdatedAt(input.getUpdatedAt());
        expenseOutputDto.setCreatedBy(input.getCreatedBy());
        expenseOutputDto.setLastModifiedBy(input.getLastModifiedBy());

        return expenseOutputDto;
    }

    @Override
    public ExpenseEntity toEntity(ExpenseInputDto input) {
        ExpenseEntity expenseEntity = new ExpenseEntity();
        expenseEntity.setId(input.getId());
        expenseEntity.setName(input.getName());
        expenseEntity.setValue(input.getValue());
        expenseEntity.setExpenseDate(input.getExpenseDate());
        expenseEntity.setInstallments(input.getInstallments());

        CardEntity cardEntity = null;
        if (input.getCard() != null) {
            cardEntity = new CardEntity();
            cardEntity.setId(input.getCard().getId());
        }
        expenseEntity.setCard(cardEntity);

        CategoryEntity categoryEntity = null;
        if (input.getCategory() != null) {
            categoryEntity = new CategoryEntity();
            categoryEntity.setId(input.getCategory().getId());
        }
        expenseEntity.setCategory(categoryEntity);
        expenseEntity.setCreatedAt(input.getCreatedAt());
        expenseEntity.setUpdatedAt(input.getUpdatedAt());
        expenseEntity.setCreatedBy(input.getCreatedBy());
        expenseEntity.setLastModifiedBy(input.getLastModifiedBy());

        return expenseEntity;
    }
}
