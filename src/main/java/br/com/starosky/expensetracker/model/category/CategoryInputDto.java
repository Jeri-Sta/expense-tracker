package br.com.starosky.expensetracker.model.category;

import br.com.starosky.expensetracker.model.GeneralDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryInputDto extends GeneralDto {

    private UUID id;
    @NotBlank
    private String name;
    private String color;
    private boolean fixedExpense;
}
