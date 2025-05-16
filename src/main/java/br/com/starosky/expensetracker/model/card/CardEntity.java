package br.com.starosky.expensetracker.model.card;

import br.com.starosky.expensetracker.model.GeneralEntity;
import br.com.starosky.expensetracker.model.bank.BankEntity;
import br.com.starosky.expensetracker.model.expense.ExpenseEntity;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "card")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class CardEntity extends GeneralEntity {

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
    @ToString.Exclude
    private List<ExpenseEntity> expenses;

    @OneToMany(mappedBy = "card")
    @ToString.Exclude
    private List<InstallmentEntity> installments;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        CardEntity that = (CardEntity) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
