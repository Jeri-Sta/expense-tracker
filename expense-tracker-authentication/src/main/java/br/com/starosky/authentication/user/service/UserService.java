package br.com.starosky.authentication.user.service;

import br.com.starosky.authentication.group.service.GroupService;
import br.com.starosky.authentication.infra.jwt.JwtUtils;
import br.com.starosky.authentication.infra.schema.SchemaService;
import br.com.starosky.authentication.infra.service.UserDetailsImpl;
import br.com.starosky.authentication.user.model.AccessDTO;
import br.com.starosky.authentication.user.model.AuthenticationDTO;
import br.com.starosky.authentication.user.model.GeneralInfoInputDto;
import br.com.starosky.authentication.user.model.UserEntity;
import br.com.starosky.authentication.user.model.UserInputDto;
import br.com.starosky.authentication.user.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.experimental.FieldDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserService {

    @Autowired
    JwtUtils jwtUtils;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    UserRepository repository;
    @Autowired
    BCryptPasswordEncoder passwordEncoder;
    @Autowired
    SchemaService schemaService;
    @Autowired
    GroupService groupService;

    @Value("${security.internal-operations-key}")
    String internalOperationsKey;

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

            if (data.getOwnerEmail() == null) {
                schemaService.createSchemaForEmail(user.getEmail());
                setPaymentDay(user.getSchemaName(), data.getPaymentDay());
            }
            repository.save(user);
        }
        return ResponseEntity.ok().build();
    }

    private void setPaymentDay(@NotBlank String schemaName, Integer paymentDay) {
        RestTemplate restTemplate = new RestTemplate();

        GeneralInfoInputDto dto = new GeneralInfoInputDto();
        dto.setSchemaName(schemaName);
        dto.setPaymentDay(paymentDay);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Operations", internalOperationsKey);

        HttpEntity<GeneralInfoInputDto> request = new HttpEntity<>(dto, headers);

        restTemplate.postForEntity("http://localhost:8083/expense-tracker/general-info", request, Void.class);
    }
}
