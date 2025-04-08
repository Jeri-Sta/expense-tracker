package br.com.starosky.authentication.infra.schema;

import br.com.starosky.authentication.group.service.GroupService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SchemaService {

    final JdbcTemplate jdbcTemplate;
    final GroupService groupService;

    @Value("${spring.datasource.url}")
    String datasourceUrl;

    @Value("${spring.datasource.username}")
    String datasourceUsername;

    @Value("${spring.datasource.password}")
    String datasourcePassword;

    @Value("${security.internal-api-key}")
    private String internalAuthSecret;

    public SchemaService(JdbcTemplate jdbcTemplate, GroupService groupService) {
        this.jdbcTemplate = jdbcTemplate;
        this.groupService = groupService;
    }

    /**
     * Cria schema por domínio de email.
     */
    public void createSchemaForEmail(String email) {
        String schemaName = createSchemaName(email);

        if (!doesSchemaExist(schemaName)) {
            createSchema(email, schemaName);
        }
    }

    private boolean doesSchemaExist(String schemaName) {
        List<String> result = jdbcTemplate.queryForList(
                "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?",
                String.class, schemaName);
        return !result.isEmpty();
    }

    private void createSchema(String email, String schemaName) {
       migrateSchema(schemaName);

        groupService.createGroup(email, schemaName);
    }

    public String createSchemaName(String email) {
        try {
            byte[] bytes = MessageDigest.getInstance("MD5").digest(email.getBytes());
            StringBuilder hexString = new StringBuilder("group_");
            for (byte b : bytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash MD5 para o schema", e);
        }
    }

    public void migrateSchema(String schemaName) {
        RestTemplate restTemplate = new RestTemplate();

        TenantDto dto = new TenantDto();
        dto.setSchema(schemaName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Auth", internalAuthSecret);

        HttpEntity<TenantDto> request = new HttpEntity<>(dto, headers);

        restTemplate.postForEntity("http://localhost:8083/expense-tracker/tenants/migrate", request, Void.class);
    }
}
