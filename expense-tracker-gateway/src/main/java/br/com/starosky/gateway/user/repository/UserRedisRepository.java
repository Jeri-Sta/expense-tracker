package br.com.starosky.gateway.user.repository;

import br.com.starosky.gateway.user.model.UserSessionEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRedisRepository extends CrudRepository<UserSessionEntity, UUID> {

    Optional<UserSessionEntity> findByEmail(String email);
}
