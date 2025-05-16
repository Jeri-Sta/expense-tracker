package br.com.starosky.expensetracker.repository;

import br.com.starosky.expensetracker.infra.ScopedRepository;
import br.com.starosky.expensetracker.model.card.CardEntity;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CardRepository extends ScopedRepository<CardEntity, UUID> {
}
