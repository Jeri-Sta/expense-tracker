package br.com.starosky.authentication.user.service;

import br.com.starosky.authentication.group.service.GroupService;
import br.com.starosky.authentication.infra.jwt.JwtUtils;
import br.com.starosky.authentication.infra.schema.SchemaService;
import br.com.starosky.authentication.infra.service.UserDetailsImpl;
import br.com.starosky.authentication.user.model.AccessDTO;
import br.com.starosky.authentication.user.model.AuthenticationDTO;
import br.com.starosky.authentication.user.model.UserEntity;
import br.com.starosky.authentication.user.model.UserInputDto;
import br.com.starosky.authentication.user.repository.UserRepository;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class UserService {

    JwtUtils jwtUtils;
    AuthenticationManager authenticationManager;
    UserRepository repository;
    BCryptPasswordEncoder passwordEncoder;
    SchemaService schemaService;
    GroupService groupService;

    public AccessDTO login(AuthenticationDTO authDTO) {
        try {
            UsernamePasswordAuthenticationToken userAuth = new UsernamePasswordAuthenticationToken(authDTO.getEmail(),
                    authDTO.getPassword());
            Authentication authentication = authenticationManager.authenticate(userAuth);
            UserDetailsImpl userAuthenticate = (UserDetailsImpl) authentication.getPrincipal();
            UserEntity userEntity = repository.findByEmail(authDTO.getEmail());
            schemaService.migrateSchema(userEntity.getSchemaName());

            String token = jwtUtils.generateTokenFromUserDetailsImpl(userAuthenticate, userEntity.getSchemaName());

            return new AccessDTO(token, userAuthenticate.getEmail());
        } catch (BadCredentialsException e) {
            System.out.println(e.getMessage());
        }
        return new AccessDTO("Acesso negado.");
    }

    public ResponseEntity<?> createUser(UserInputDto data) {
        UserEntity optionalUserEmail = repository.findByEmail(data.getEmail());

        if (optionalUserEmail != null) {
            return ResponseEntity.badRequest().body("User with this e-mail already exists.");
        } else {
            UserEntity user = new UserEntity();
            user.setName(data.getName());
            user.setEmail(data.getEmail());
            user.setPassword(passwordEncoder.encode(data.getPassword()));
            user.setSchemaName(data.getOwnerEmail() != null ? schemaService.createSchemaName(data.getOwnerEmail())
                    : schemaService.createSchemaName(data.getEmail()));

            if (data.getOwnerEmail() != null && groupService.getSchemaByOwnerEmail(data.getOwnerEmail()) == null) {
                return ResponseEntity.badRequest().body("Owner user was not found.");
            }

            repository.save(user);

            if (data.getOwnerEmail() == null) {
                schemaService.createSchemaForEmail(user.getEmail());
            }
        }
        return ResponseEntity.ok().build();
    }
}
