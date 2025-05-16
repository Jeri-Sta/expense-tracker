package br.com.starosky.expensetracker.model.installment;

import br.com.starosky.expensetracker.model.GeneralEntity;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "installment")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class InstallmentEntity extends GeneralEntity {

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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        InstallmentEntity that = (InstallmentEntity) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
