package br.com.starosky.expensetracker.income.mapper;

import br.com.starosky.expensetracker.income.model.IncomeEntity;
import br.com.starosky.expensetracker.income.model.IncomeOutputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class IncomeEntityToIncomeOutputMapper implements Mapper<IncomeEntity, IncomeOutputDto> {

    @Override
    public IncomeOutputDto mapNonNull(IncomeEntity input) {
        IncomeOutputDto output = new IncomeOutputDto();
        output.setId(input.getId());
        output.setName(input.getName());
        output.setValue(input.getValue());
        output.setIncomeDate(input.getIncomeDate());
        return output;
    }
}
