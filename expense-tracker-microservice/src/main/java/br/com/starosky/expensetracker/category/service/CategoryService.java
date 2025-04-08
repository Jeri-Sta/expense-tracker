package br.com.starosky.expensetracker.category.service;

import br.com.starosky.expensetracker.category.repository.CategoryRepository;
import br.com.starosky.expensetracker.infra.Mapper;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.category.model.CategoryInputDto;
import br.com.starosky.expensetracker.category.model.CategoryOutputDto;
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
    Mapper<CategoryEntity, CategoryOutputDto> categoryEntityCategoryOutputDtoMapper;
    Mapper<CategoryInputDto, CategoryEntity> categoryInputDtoCategoryEntityMapper;

    public Page<CategoryOutputDto> list(Pageable pageable) {
        Page<CategoryEntity> entityPage = repository.findAll(pageable);
        return entityPage.map(categoryEntityCategoryOutputDtoMapper::mapNonNull);
    }

    public CategoryOutputDto save(CategoryInputDto dto) {
        CategoryEntity entity = categoryInputDtoCategoryEntityMapper.mapNonNull(dto);
        CategoryEntity savedEntity = repository.save(entity);
        return categoryEntityCategoryOutputDtoMapper.mapNonNull(savedEntity);
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
        List<CategoryEntity> categoryEntities = repository.findAllByOrderByNameAsc();
        return categoryEntities.stream()
                .map(categoryEntityCategoryOutputDtoMapper::mapNonNull)
                .toList();
    }
}
