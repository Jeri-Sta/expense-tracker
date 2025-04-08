package br.com.starosky.expensetracker.income.service;

import br.com.starosky.expensetracker.generalinfo.service.GeneralInfoService;
import br.com.starosky.expensetracker.income.model.IncomeEntity;
import br.com.starosky.expensetracker.income.model.IncomeInputDto;
import br.com.starosky.expensetracker.income.model.IncomeOutputDto;
import br.com.starosky.expensetracker.income.repository.IncomeRepository;
import br.com.starosky.expensetracker.infra.Mapper;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
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
    Mapper<IncomeEntity, IncomeOutputDto> incomeEntityIncomeOutputDtoMapper;
    Mapper<IncomeInputDto, IncomeEntity> incomeInputDtoIncomeEntityMapper;
    GeneralInfoService generalInfoService;

    public List<IncomeOutputDto> list(LocalDate referenceDate) {
        LocalDate startDate = LocalDate.of(referenceDate.getYear(), referenceDate.getMonth(),
                generalInfoService.getPaymentDay() + 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return repository.findByIncomeDate(startDate, endDate).stream()
                .map(incomeEntityIncomeOutputDtoMapper::mapNonNull)
                .toList();
    }

    public IncomeOutputDto save(IncomeInputDto dto) {
        IncomeEntity entity = incomeInputDtoIncomeEntityMapper.mapNonNull(dto);
        IncomeEntity savedEntity = repository.save(entity);
        return incomeEntityIncomeOutputDtoMapper.mapNonNull(savedEntity);
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