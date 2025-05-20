package br.com.starosky.expensetracker.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public abstract class GeneralDto {

    protected Instant createdAt;

    protected Instant updatedAt;

    protected String createdBy;

    protected String lastModifiedBy;
}
