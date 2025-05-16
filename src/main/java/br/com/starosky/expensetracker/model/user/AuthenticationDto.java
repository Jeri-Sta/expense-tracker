package br.com.starosky.expensetracker.model.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthenticationDto {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
