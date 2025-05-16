package br.com.starosky.expensetracker.model.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInputDto {
    @NotBlank
    private String name;
    @NotBlank
    private String password;
    @NotBlank
    private String email;
    private Integer paymentDay;
}
