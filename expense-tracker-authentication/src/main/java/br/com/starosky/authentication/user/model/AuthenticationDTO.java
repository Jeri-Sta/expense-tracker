package br.com.starosky.authentication.user.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthenticationDTO {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
