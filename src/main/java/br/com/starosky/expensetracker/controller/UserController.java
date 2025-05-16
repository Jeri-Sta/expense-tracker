package br.com.starosky.expensetracker.controller;

import br.com.starosky.expensetracker.model.user.AccessDto;
import br.com.starosky.expensetracker.model.user.AuthenticationDto;
import br.com.starosky.expensetracker.model.user.UserInputDto;
import br.com.starosky.expensetracker.service.UserService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/auth")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AccessDto> registerUser(@RequestBody UserInputDto payload) {
        return ResponseEntity.ok(userService.createUser(payload));
    }

    @PostMapping("/login")
    public ResponseEntity<AccessDto> login(@RequestBody AuthenticationDto payload) {
        return ResponseEntity.ok(userService.login(payload));
    }
}
