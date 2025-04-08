package br.com.starosky.expensetracker.installment.model;

import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "installment")
@Data
@NoArgsConstructor
public class InstallmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private int installmentNumber = 1;

    @NotNull
    private LocalDate installmentDate = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "expense", nullable = false)
    private ExpenseEntity expense;

    @ManyToOne
    @JoinColumn(name = "card", nullable = false)
    private CardEntity card;

    @NotNull
    private BigDecimal value = BigDecimal.ZERO;
}
