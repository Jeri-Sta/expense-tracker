package br.com.starosky.expensetracker.model.expense;

import br.com.starosky.expensetracker.model.GeneralEntity;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.category.CategoryEntity;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = "expense")
public class ExpenseEntity extends GeneralEntity {

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
    @ToString.Exclude
    private List<InstallmentEntity> installmentsRegisters;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        ExpenseEntity that = (ExpenseEntity) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
