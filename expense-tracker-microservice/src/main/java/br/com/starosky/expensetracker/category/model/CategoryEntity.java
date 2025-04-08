package br.com.starosky.expensetracker.category.model;

import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "category")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @NotBlank
    private String name;

    private String color;

    @NotNull
    private boolean fixedExpense;

    @OneToMany(mappedBy = "category")
    private List<ExpenseEntity> expenses;
}
