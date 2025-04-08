package br.com.starosky.expensetracker.infra.database.migration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tenants")
public class TenantMigrationController {

    private final TenantProvisioningService provisioningService;
    private final TenantMigrationService migrationService;

    public TenantMigrationController(
            TenantProvisioningService provisioningService,
            TenantMigrationService migrationService
    ) {
        this.provisioningService = provisioningService;
        this.migrationService = migrationService;
    }

    @PostMapping("/migrate")
    public ResponseEntity<Void> createAndMigrate(@RequestBody TenantDto dto) {
        try {
            provisioningService.createTenantSchema(dto.getSchema());
            migrationService.migrateSchema(dto.getSchema());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
