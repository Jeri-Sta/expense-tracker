package br.com.starosky.expensetracker.income.mapper;

import br.com.starosky.expensetracker.income.model.IncomeEntity;
import br.com.starosky.expensetracker.income.model.IncomeInputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class IncomeInputDtoToIncomeEntityMapper implements Mapper<IncomeInputDto, IncomeEntity> {

    @Override
    public IncomeEntity mapNonNull(IncomeInputDto input) {
        IncomeEntity entity = new IncomeEntity();
        entity.setId(input.getId());
        entity.setName(input.getName());
        entity.setValue(input.getValue());
        entity.setIncomeDate(input.getIncomeDate());
        return entity;
    }
}
