package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.mapper.Mapper;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.model.category.CategoryEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseInputDto;
import br.com.starosky.expensetracker.model.expense.ExpenseOutputDto;
import br.com.starosky.expensetracker.repository.ExpenseRepository;
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
    Mapper<ExpenseEntity, ExpenseInputDto, ExpenseOutputDto> mapper;
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
                .map(mapper::toDto).toList();
    }

    public ExpenseOutputDto save(ExpenseInputDto dto) throws CrudException {
        CardEntity cardEntity = dto.getCard() != null && dto.getCard().getId() != null
                ? cardService.findById(dto.getCard().getId())
                : null;
        CategoryEntity categoryEntity = dto.getCategory() != null && dto.getCategory().getId() != null
                ? categoryService.findById(dto.getCategory().getId())
                : null;

        ExpenseEntity entity = mapper.toEntity(dto);
        entity.setCard(cardEntity);
        entity.setCategory(categoryEntity);

        installmentService.calculateInstallments(entity);

        entity = repository.save(entity);

        return mapper.toDto(entity);
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
