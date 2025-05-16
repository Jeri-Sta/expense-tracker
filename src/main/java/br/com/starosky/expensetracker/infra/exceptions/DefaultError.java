package br.com.starosky.expensetracker.infra.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DefaultError {
    private final String code;
    private final String message;
}
