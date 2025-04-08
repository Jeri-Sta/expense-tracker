package br.com.starosky.expensetracker.infra.database;

import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class SchemaAwareDataSource extends AbstractDataSource {

    private final DataSource delegate;

    public SchemaAwareDataSource(DataSource delegate) {
        this.delegate = delegate;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = delegate.getConnection();
        setSchema(connection);
        return connection;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection connection = delegate.getConnection(username, password);
        setSchema(connection);
        return connection;
    }

    private void setSchema(Connection connection) throws SQLException {
        String tenant = TenantContext.getCurrentTenant();
        if (tenant != null) {
            connection.createStatement().execute("SET search_path TO " + tenant);
        }
    }
}
