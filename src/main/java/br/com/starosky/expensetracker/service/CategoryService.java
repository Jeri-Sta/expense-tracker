package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.mapper.Mapper;
import br.com.starosky.expensetracker.model.category.CategoryEntity;
import br.com.starosky.expensetracker.model.category.CategoryInputDto;
import br.com.starosky.expensetracker.model.category.CategoryOutputDto;
import br.com.starosky.expensetracker.repository.CategoryRepository;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class CategoryService {

    CategoryRepository repository;
    Mapper<CategoryEntity, CategoryInputDto, CategoryOutputDto> mapper;

    public Page<CategoryOutputDto> list(Pageable pageable) {
        Page<CategoryEntity> entityPage = repository.findAll(SpecificationBuilder.empty(), pageable);
        return entityPage.map(mapper::toDto);
    }

    public CategoryOutputDto save(CategoryInputDto dto) {
        CategoryEntity entity = mapper.toEntity(dto);
        CategoryEntity savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public CategoryOutputDto update(UUID id, CategoryInputDto dto) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Categoria não encontrada");
        }
        dto.setId(id);
        return save(dto);
    }

    public boolean delete(UUID id) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Categoria não encontrada");
        }
        repository.deleteById(id);
        return true;
    }

    public CategoryEntity findById(UUID id) throws CrudException {
        return repository.findById(id).orElseThrow(() -> new CrudException("Categoria não encontrada"));
    }

    public List<CategoryOutputDto> listAll() {
        List<CategoryEntity> categoryEntities = repository.findAll(SpecificationBuilder.orderBy("name", true));
        return categoryEntities.stream()
                .map(mapper::toDto)
                .toList();
    }
}
