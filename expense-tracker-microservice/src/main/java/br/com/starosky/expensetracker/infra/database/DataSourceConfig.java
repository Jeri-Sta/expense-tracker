package br.com.starosky.expensetracker.infra.database;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource(DataSourceProperties properties) {
        DataSource defaultDataSource = properties.initializeDataSourceBuilder().build();
        return new SchemaAwareDataSource(defaultDataSource);
    }
}
