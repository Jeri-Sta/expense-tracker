package br.com.starosky.expensetracker.expense.model;

import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.category.model.CategoryEntity;
import br.com.starosky.expensetracker.installment.model.InstallmentEntity;
import lombok.Data;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "expense")
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @NotBlank
    private String name;

    @ManyToOne
    @JoinColumn(name = "category")
    private CategoryEntity category;

    @ManyToOne
    @JoinColumn(name = "card")
    private CardEntity card;

    @NotNull
    private BigDecimal value = BigDecimal.ZERO;

    @NotNull
    private LocalDate expenseDate = LocalDate.now();

    private int installments = 1;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InstallmentEntity> installmentsRegisters;
}
