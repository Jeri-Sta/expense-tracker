package br.com.starosky.expensetracker.model.user;

import lombok.Data;

@Data
public class AccessDto {
    private String token;
    private String email;
    private String message;

    public AccessDto(String message) {
        this.message = message;
    }

    public AccessDto(String token, String email) {
        this.token = token;
        this.email = email;
    }
}
