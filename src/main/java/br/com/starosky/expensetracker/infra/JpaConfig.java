package br.com.starosky.expensetracker.infra;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaRepositories(
        basePackages = "br.com.starosky.expensetracker",
        repositoryBaseClass = ScopedRepositoryImpl.class
)
public class JpaConfig {
}
