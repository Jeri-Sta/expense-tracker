package br.com.starosky.expensetracker.mapper;

public interface Mapper<E, I, O> {
    O toDto(E input);
    E toEntity(I input);
}
