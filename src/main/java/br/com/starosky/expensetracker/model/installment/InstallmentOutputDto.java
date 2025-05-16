package br.com.starosky.expensetracker.model.installment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentOutputDto {

    private UUID id;
    private int installmentNumber = 1;
    private LocalDate installmentDate = LocalDate.now();
    private BigDecimal value = BigDecimal.ZERO;
}
