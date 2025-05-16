package br.com.starosky.expensetracker.model.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryInputDto {

    private UUID id;
    @NotBlank
    private String name;
    private String color;
    private boolean fixedExpense;
}
