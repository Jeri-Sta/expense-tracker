package br.com.starosky.expensetracker.infra.database.migration;

import lombok.Data;

@Data
public class TenantDto {
    private String schema;
}
