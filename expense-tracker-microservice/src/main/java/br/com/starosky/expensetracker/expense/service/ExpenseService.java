package br.com.starosky.expensetracker.expense.service;

import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.card.model.CardOutputDto;
import br.com.starosky.expensetracker.card.service.CardService;
import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.category.service.CategoryService;
import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseInputDto;
import br.com.starosky.expensetracker.expense.model.ExpenseOutputDto;
import br.com.starosky.expensetracker.expense.repository.ExpenseRepository;
import br.com.starosky.expensetracker.generalinfo.service.GeneralInfoService;
import br.com.starosky.expensetracker.infra.Mapper;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.installment.service.InstallmentService;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class ExpenseService {

    ExpenseRepository repository;
    Mapper<ExpenseEntity, ExpenseOutputDto> expenseEntityExpenseOutputDtoMapper;
    Mapper<ExpenseInputDto, ExpenseEntity> expenseInputDtoExpenseEntityMapper;
    CardService cardService;
    CategoryService categoryService;
    InstallmentService installmentService;
    GeneralInfoService generalInfoService;

    public List<ExpenseOutputDto> list(LocalDate referenceDate) {
        LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(),
                generalInfoService.getPaymentDay() + 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<ExpenseEntity> expenses = repository.findByExpenseDate(startDate, endDate);

        Map<UUID, Integer> cardByClosingDate = cardService.listAll().stream()
                .collect(Collectors.toMap(CardOutputDto::getId, CardOutputDto::getClosingDay));

        for (Map.Entry<UUID, Integer> entry : cardByClosingDate.entrySet()) {
            LocalDate cardStartDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(), entry.getValue());
            LocalDate cardEndDate = cardStartDate.plusMonths(1).minusDays(1);
            expenses.addAll(repository.findByCardExpense(cardStartDate, cardEndDate, entry.getKey()));
        }

        return expenses.stream()
                .map(expenseEntityExpenseOutputDtoMapper::mapNonNull).toList();
    }

    public ExpenseOutputDto save(ExpenseInputDto dto) throws CrudException {
        CardEntity cardEntity = dto.getCard() != null && dto.getCard().getId() != null
                ? cardService.findById(dto.getCard().getId())
                : null;
        CategoryEntity categoryEntity = dto.getCategory() != null && dto.getCategory().getId() != null
                ? categoryService.findById(dto.getCategory().getId())
                : null;

        ExpenseEntity entity = expenseInputDtoExpenseEntityMapper.mapNonNull(dto);
        entity.setCard(cardEntity);
        entity.setCategory(categoryEntity);

        installmentService.calculateInstallments(entity);

        entity = repository.save(entity);

        return expenseEntityExpenseOutputDtoMapper.mapNonNull(entity);
    }

    public ExpenseOutputDto update(UUID id, ExpenseInputDto dto) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Gasto não encontrado");
        }
        return save(dto);
    }

    public boolean delete(UUID id) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Gasto não encontrado");
        }
        repository.deleteById(id);
        return true;
    }

    public BigDecimal getMonthTotalExpenses(LocalDate referenceDate) {
        LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(),
                generalInfoService.getPaymentDay() + 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        BigDecimal total = repository.sumMonthExpenses(startDate, endDate);

        Map<UUID, Integer> cardByClosingDate = cardService.listAll().stream()
                .collect(Collectors.toMap(CardOutputDto::getId, CardOutputDto::getClosingDay));

        for (Map.Entry<UUID, Integer> entry : cardByClosingDate.entrySet()) {
            LocalDate cardStartDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(), entry.getValue());
            LocalDate cardEndDate = cardStartDate.plusMonths(1).minusDays(1);
            total = total.add(repository.sumCardMonthExpenses(cardStartDate, cardEndDate, entry.getKey()));
        }

        return total;
    }
}
