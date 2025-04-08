package br.com.starosky.authentication.user.model;

import lombok.Data;

@Data
public class AccessDTO {
    private String token;
    private String email;
    private String message;

    public AccessDTO(String message) {
        this.message = message;
    }

    public AccessDTO(String token, String email) {
        this.token = token;
        this.email = email;
    }
}
