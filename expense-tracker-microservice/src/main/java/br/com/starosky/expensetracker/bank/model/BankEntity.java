package br.com.starosky.expensetracker.bank.model;

import br.com.starosky.expensetracker.card.model.CardEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "bank")
public class BankEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @NotBlank
    private String name;

    @NotNull
    private BigDecimal balance = BigDecimal.ZERO;

    @OneToMany(mappedBy = "bank")
    private List<CardEntity> cards;
}
