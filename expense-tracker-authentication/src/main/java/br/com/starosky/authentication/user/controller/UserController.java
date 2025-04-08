package br.com.starosky.authentication.user.controller;

import br.com.starosky.authentication.user.model.AccessDTO;
import br.com.starosky.authentication.user.model.AuthenticationDTO;
import br.com.starosky.authentication.user.model.UserInputDto;
import br.com.starosky.authentication.user.service.UserService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    public ResponseEntity registerUser(@RequestBody UserInputDto payload) {
        return userService.createUser(payload);
    }

    @PostMapping("/login")
    public ResponseEntity<AccessDTO> login(@RequestBody AuthenticationDTO payload) {
        return ResponseEntity.ok(userService.login(payload));
    }
}