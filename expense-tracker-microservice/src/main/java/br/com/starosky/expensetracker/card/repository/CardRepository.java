package br.com.starosky.expensetracker.card.repository;

import br.com.starosky.expensetracker.card.model.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<CardEntity, UUID> {

    List<CardEntity> findAllByOrderByBankNameAsc();
}
