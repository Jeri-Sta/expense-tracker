package br.com.starosky.expensetracker.infra;

import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

public class ScopedRepositoryImpl<T, ID extends Serializable>
        extends SimpleJpaRepository<T, ID> {

    private final EntityManager em;
    private final JpaEntityInformation<T, ?> entityInformation;

    public ScopedRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager em) {
        super(entityInformation, em);
        this.em = em;
        this.entityInformation = entityInformation;
    }

    private Specification<T> addUserScope(Specification<T> originalSpec) {
        return (root, query, cb) -> {
            Predicate userPredicate = cb.equal(root.get("createdBy"), SpecificationBuilder.getCurrentUsername());
            if (originalSpec != null) {
                return cb.and(userPredicate, originalSpec.toPredicate(root, query, cb));
            }
            return userPredicate;
        };
    }

    @Override
    public List<T> findAll(Specification<T> spec) {
        return super.findAll(addUserScope(spec));
    }

    @Override
    public Page<T> findAll(Specification<T> spec, Pageable pageable) {
        return super.findAll(addUserScope(spec), pageable);
    }

    @Override
    public long count(Specification<T> spec) {
        return super.count(addUserScope(spec));
    }

    @Override
    public Optional<T> findOne(Specification<T> spec) {
        return super.findOne(addUserScope(spec));
    }

    @Override
    public Optional<T> findById(ID id) {
        return super.findOne(SpecificationBuilder.id(id));
    }

    @Override
    public boolean existsById(ID id) {
        return super.exists(SpecificationBuilder.id(id));
    }

    @Override
    public void deleteById(ID id) {
        super.delete(SpecificationBuilder.id(id));
    }

}

