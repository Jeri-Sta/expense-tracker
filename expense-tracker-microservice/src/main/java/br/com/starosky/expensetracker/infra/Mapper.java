package br.com.starosky.expensetracker.infra;

public interface Mapper<E, S> {
    S mapNonNull(E input);

    default S mapNullable(E input) {
        return input == null ? null : mapNonNull(input);
    }
}
