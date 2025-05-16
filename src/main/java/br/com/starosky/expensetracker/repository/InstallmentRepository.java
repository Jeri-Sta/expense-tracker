package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.ScopedRepository;
import br.com.starosky.expensetracker.model.installment.InstallmentEntity;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InstallmentRepository extends ScopedRepository<InstallmentEntity, UUID>, InstallmentRepositoryCustom {
}
