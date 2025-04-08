package br.com.starosky.expensetracker.infra.database.migration;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

@Service
public class TenantMigrationService {

    @Autowired
    private DataSource dataSource;

    public void migrateSchema(String schemaName) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas(schemaName)
                .locations("classpath:db/migration") // ou por tenant, se quiser
                .baselineOnMigrate(true)
                .load();

        flyway.migrate();
    }
}
