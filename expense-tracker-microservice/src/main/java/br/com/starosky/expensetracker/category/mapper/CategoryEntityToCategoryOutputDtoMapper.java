package br.com.starosky.expensetracker.category.mapper;

import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.category.model.CategoryOutputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class CategoryEntityToCategoryOutputDtoMapper implements Mapper<CategoryEntity, CategoryOutputDto> {

    @Override
    public CategoryOutputDto mapNonNull(CategoryEntity input) {
        CategoryOutputDto categoryOutputDto = new CategoryOutputDto();
        categoryOutputDto.setId(input.getId());
        categoryOutputDto.setName(input.getName());
        categoryOutputDto.setColor(input.getColor());
        categoryOutputDto.setFixedExpense(input.isFixedExpense());
        return categoryOutputDto;
    }
}
