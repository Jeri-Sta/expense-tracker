package br.com.starosky.expensetracker.bank.repository;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BankRepository extends JpaRepository<BankEntity, UUID> {

    List<BankEntity> findAllByOrderByNameAsc();
}
