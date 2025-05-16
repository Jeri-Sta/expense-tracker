package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.mapper.Mapper;
import br.com.starosky.expensetracker.model.income.IncomeEntity;
import br.com.starosky.expensetracker.model.income.IncomeInputDto;
import br.com.starosky.expensetracker.model.income.IncomeOutputDto;
import br.com.starosky.expensetracker.repository.IncomeRepository;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class IncomeService {

    IncomeRepository repository;
    Mapper<IncomeEntity, IncomeInputDto, IncomeOutputDto> mapper;
    GeneralInfoService generalInfoService;

    public List<IncomeOutputDto> list(LocalDate referenceDate) {
        LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(),
                generalInfoService.getPaymentDay() + 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return repository.findByIncomeDate(startDate, endDate).stream()
                .map(mapper::toDto)
                .toList();
    }

    public IncomeOutputDto save(IncomeInputDto dto) {
        IncomeEntity entity = mapper.toEntity(dto);
        IncomeEntity savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public IncomeOutputDto update(UUID id, IncomeInputDto dto) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Renda não encontrada");
        }
        return save(dto);
    }

    public boolean delete(UUID id) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Renda não encontrada");
        }
        repository.deleteById(id);
        return true;
    }

    public BigDecimal getMonthTotalIncomes(LocalDate referenceDate) {
        LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(),
                generalInfoService.getPaymentDay() + 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return repository.sumMonthIncomes(startDate, endDate);
    }
}
