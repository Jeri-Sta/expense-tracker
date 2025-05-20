package br.com.starosky.expensetracker.mapper;

import br.com.starosky.expensetracker.model.income.IncomeEntity;
import br.com.starosky.expensetracker.model.income.IncomeInputDto;
import br.com.starosky.expensetracker.model.income.IncomeOutputDto;
import org.springframework.stereotype.Component;

@Component
public class IncomeMapper implements Mapper<IncomeEntity, IncomeInputDto, IncomeOutputDto> {

    @Override
    public IncomeOutputDto toDto(IncomeEntity input) {
        IncomeOutputDto output = new IncomeOutputDto();
        output.setId(input.getId());
        output.setName(input.getName());
        output.setValue(input.getValue());
        output.setIncomeDate(input.getIncomeDate());
        output.setCreatedAt(input.getCreatedAt());
        output.setUpdatedAt(input.getUpdatedAt());
        output.setCreatedBy(input.getCreatedBy());
        output.setLastModifiedBy(input.getLastModifiedBy());
        return output;
    }

    @Override
    public IncomeEntity toEntity(IncomeInputDto input) {
        IncomeEntity entity = new IncomeEntity();
        entity.setId(input.getId());
        entity.setName(input.getName());
        entity.setValue(input.getValue());
        entity.setIncomeDate(input.getIncomeDate());
        entity.setCreatedAt(input.getCreatedAt());
        entity.setUpdatedAt(input.getUpdatedAt());
        entity.setCreatedBy(input.getCreatedBy());
        entity.setLastModifiedBy(input.getLastModifiedBy());
        return entity;
    }
}
