package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.model.generalinfo.GeneralInfoEntity;
import br.com.starosky.expensetracker.model.user.*;
import br.com.starosky.expensetracker.repository.UserRepository;
import br.com.starosky.expensetracker.security.JwtService;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserService {

    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    UserRepository repository;
    @Autowired
    BCryptPasswordEncoder passwordEncoder;
    @Autowired
    JwtService jwtService;
    @Autowired
    GeneralInfoService generalInfoService;

    public AccessDto login(AuthenticationDto authDTO) {
        try {
            UsernamePasswordAuthenticationToken userAuth = new UsernamePasswordAuthenticationToken(authDTO.getEmail(),
                    authDTO.getPassword());
            Authentication authentication = authenticationManager.authenticate(userAuth);
            UserDetailsImpl userAuthenticate = (UserDetailsImpl) authentication.getPrincipal();
            UserEntity userEntity = repository.findByEmail(authDTO.getEmail()).orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

            String token = jwtService.generateToken(userAuthenticate);

            return new AccessDto(token, userEntity.getEmail());
        } catch (BadCredentialsException e) {
            System.out.println(e.getMessage());
        }
        return new AccessDto("Acesso negado.");
    }

    public AccessDto createUser(UserInputDto data) {
        Optional<UserEntity> optionalUser = repository.findByEmail(data.getEmail());

        if (optionalUser.isPresent()) {
            return new AccessDto("Email já cadastrado.");
        }

        UserEntity user = new UserEntity();
        user.setName(data.getName());
        user.setEmail(data.getEmail());
        user.setPassword(passwordEncoder.encode(data.getPassword()));

        repository.save(user);

        GeneralInfoEntity generalInfoEntity = new GeneralInfoEntity();
        generalInfoEntity.setUser(user);
        generalInfoEntity.setPaymentDay(data.getPaymentDay() == null ? 2 : data.getPaymentDay());
        generalInfoEntity.setCreatedBy("system");
        generalInfoEntity.setLastModifiedBy("system");
        generalInfoEntity.setCreatedAt(Instant.now());
        generalInfoEntity.setUpdatedAt(Instant.now());
        generalInfoService.save(generalInfoEntity);

        return this.login(new AuthenticationDto(data.getEmail(), data.getPassword()));
    }
}
