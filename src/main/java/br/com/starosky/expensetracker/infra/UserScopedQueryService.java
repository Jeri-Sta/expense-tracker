package br.com.starosky.expensetracker.infra;

import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class UserScopedQueryService {

    @PersistenceContext
    private EntityManager em;

    private <T> Specification<T> addUserScope(Specification<T> originalSpec) {
        return (root, query, cb) -> {
            Predicate userPredicate = cb.equal(root.get("createdBy"), SpecificationBuilder.getCurrentUsername());
            if (originalSpec != null) {
                return cb.and(userPredicate, originalSpec.toPredicate(root, query, cb));
            }
            return userPredicate;
        };
    }

    public <T> List<T> findAll(Specification<T> spec, Class<T> entityClass) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);

        Predicate predicate = addUserScope(spec).toPredicate(root, query, cb);
        query.select(root).where(predicate);

        return em.createQuery(query).getResultList();
    }

    public <T> Page<T> findAll(Specification<T> spec, Class<T> entityClass, Pageable pageable) {
        List<T> content = em.createQuery(buildQuery(spec, entityClass, pageable)).getResultList();
        long total = count(spec, entityClass);
        return new PageImpl<>(content, pageable, total);
    }

    public <T> long count(Specification<T> spec, Class<T> entityClass) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<T> root = query.from(entityClass);

        query.select(cb.count(root));
        query.where(addUserScope(spec).toPredicate(root, query, cb));

        return em.createQuery(query).getSingleResult();
    }

    public <T> BigDecimal sum(Specification<T> spec, String field, Class<T> entityClass) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<BigDecimal> query = cb.createQuery(BigDecimal.class);
        Root<T> root = query.from(entityClass);

        query.select(cb.coalesce(cb.sum(root.get(field)), BigDecimal.ZERO));
        query.where(addUserScope(spec).toPredicate(root, query, cb));

        return em.createQuery(query).getSingleResult();
    }

    public <T> void delete(Specification<T> spec, Class<T> entityClass) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);
        query.select(root).where(addUserScope(spec).toPredicate(root, query, cb));

        List<T> entitiesToDelete = em.createQuery(query).getResultList();
        for (T entity : entitiesToDelete) {
            em.remove(entity);
        }
    }

    private <T> CriteriaQuery<T> buildQuery(Specification<T> spec, Class<T> entityClass, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);
        query.select(root).where(addUserScope(spec).toPredicate(root, query, cb));

        // Ordenação
        if (pageable.getSort().isSorted()) {
            query.orderBy(pageable.getSort().stream()
                    .map(order -> order.isAscending() ?
                            cb.asc(root.get(order.getProperty())) :
                            cb.desc(root.get(order.getProperty())))
                    .toList());
        }

        return query;
    }
}
