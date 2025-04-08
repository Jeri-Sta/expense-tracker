package br.com.starosky.expensetracker.card.model;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import br.com.starosky.expensetracker.expense.model.ExpenseEntity;
import br.com.starosky.expensetracker.installment.model.InstallmentEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "card")
@Data
public class CardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "bank", nullable = false)
    private BankEntity bank;

    @NotNull
    @Column(name = "card_limit")
    private BigDecimal limit = BigDecimal.ZERO;

    @NotNull
    private int closingDay = 2;

    @OneToMany(mappedBy = "card")
    private List<ExpenseEntity> expenses;

    @OneToMany(mappedBy = "card")
    private List<InstallmentEntity> installments;

}
