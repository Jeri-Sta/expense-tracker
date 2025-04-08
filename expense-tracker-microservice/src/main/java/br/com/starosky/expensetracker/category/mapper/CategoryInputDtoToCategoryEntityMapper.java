package br.com.starosky.expensetracker.category.mapper;

import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.category.model.CategoryInputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class CategoryInputDtoToCategoryEntityMapper implements Mapper<CategoryInputDto, CategoryEntity> {

    @Override
    public CategoryEntity mapNonNull(CategoryInputDto input) {
        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setId(input.getId());
        categoryEntity.setName(input.getName());
        categoryEntity.setColor(input.getColor());
        categoryEntity.setFixedExpense(input.isFixedExpense());
        return categoryEntity;
    }
}
