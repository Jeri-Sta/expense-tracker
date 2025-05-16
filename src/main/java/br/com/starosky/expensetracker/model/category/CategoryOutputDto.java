package br.com.starosky.expensetracker.model.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryOutputDto {
    private UUID id;
    private String name;
    private String color;
    private boolean fixedExpense;
}
