package br.com.starosky.expensetracker.utils;

import br.com.starosky.expensetracker.model.user.UserDetailsImpl;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;

public class SpecificationBuilder {

    public static <T> Specification<T> empty() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static <T> Specification<T> containsIgnoreCase(String field, String value) {
        return (root, query, cb) -> cb.like(
                cb.lower(root.get(field)),
                "%" + value.toLowerCase() + "%"
        );
    }

    public static <T> Specification<T> equalsTo(String field, Object value) {
        return (root, query, cb) -> cb.equal(root.get(field), value);
    }

    public static <T> Specification<T> isNull(String field) {
        return (root, query, cb) -> cb.isNull(root.get(field));
    }

    public static <T> Specification<T> id(Object value) {
        return (root, query, cb) -> cb.equal(root.get("id"), value);
    }

    public static <T, Y> Specification<T> join(String field, JoinType joinType, String joinField, Y value) {
        return (root, query, cb) -> {
            Join<T, Y> join = root.join(field, joinType);
            return cb.equal(join.get(joinField), value);
        };
    }

    public static <T> Specification<T> isTrue(String field) {
        return (root, query, cb) -> cb.isTrue(root.get(field));
    }

    public static <T> Specification<T> isFalse(String field) {
        return (root, query, cb) -> cb.isFalse(root.get(field));
    }

    public static <T> Specification<T> betweenDates(String field, LocalDate start, LocalDate end) {
        return (root, query, cb) -> cb.between(root.get(field), start, end);
    }

    public static <T> Specification<T> orderBy(String field, boolean ascending) {
        return (root, query, cb) -> {
            if (ascending) {
                query.orderBy(cb.asc(root.get(field)));
            } else {
                query.orderBy(cb.desc(root.get(field)));
            }
            return cb.conjunction();
        };
    }

    public static <T> Specification<T> orderByJoin(String joinField, String targetField, boolean ascending) {
        return (root, query, cb) -> {
            var join = root.join(joinField);
            if (ascending) {
                query.orderBy(cb.asc(join.get(targetField)));
            } else {
                query.orderBy(cb.desc(join.get(targetField)));
            }
            return cb.conjunction();
        };
    }

    public static <T> Specification<T> where(List<Specification<T>> specifications) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();
            for (Specification<T> spec : specifications) {
                predicate = cb.and(predicate, spec.toPredicate(root, query, cb));
            }
            return predicate;
        };
    }

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        return auth.isAuthenticated() ? userDetails.getEmail() : null;
    }

    // E você pode adicionar mais conforme a necessidade
}

