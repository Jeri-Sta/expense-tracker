package br.com.starosky.expensetracker.mapper;

import br.com.starosky.expensetracker.model.category.CategoryEntity;
import br.com.starosky.expensetracker.model.category.CategoryInputDto;
import br.com.starosky.expensetracker.model.category.CategoryOutputDto;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper implements Mapper<CategoryEntity, CategoryInputDto, CategoryOutputDto> {

    @Override
    public CategoryOutputDto toDto(CategoryEntity input) {
        CategoryOutputDto categoryOutputDto = new CategoryOutputDto();
        categoryOutputDto.setId(input.getId());
        categoryOutputDto.setName(input.getName());
        categoryOutputDto.setColor(input.getColor());
        categoryOutputDto.setFixedExpense(input.isFixedExpense());
        categoryOutputDto.setCreatedAt(input.getCreatedAt());
        categoryOutputDto.setUpdatedAt(input.getUpdatedAt());
        categoryOutputDto.setCreatedBy(input.getCreatedBy());
        categoryOutputDto.setLastModifiedBy(input.getLastModifiedBy());

        return categoryOutputDto;
    }

    @Override
    public CategoryEntity toEntity(CategoryInputDto input) {
        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setId(input.getId());
        categoryEntity.setName(input.getName());
        categoryEntity.setColor(input.getColor());
        categoryEntity.setFixedExpense(input.isFixedExpense());
        categoryEntity.setCreatedAt(input.getCreatedAt());
        categoryEntity.setUpdatedAt(input.getUpdatedAt());
        categoryEntity.setCreatedBy(input.getCreatedBy());
        categoryEntity.setLastModifiedBy(input.getLastModifiedBy());
        return categoryEntity;
    }
}
