package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.ScopedRepository;
import br.com.starosky.expensetracker.model.category.CategoryEntity;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CategoryRepository extends ScopedRepository<CategoryEntity, UUID> {
}
