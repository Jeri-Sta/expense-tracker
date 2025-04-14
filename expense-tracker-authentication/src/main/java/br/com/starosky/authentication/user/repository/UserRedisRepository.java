package br.com.starosky.authentication.user.repository;

import br.com.starosky.authentication.user.model.UserSessionEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface UserRedisRepository extends CrudRepository<UserSessionEntity, UUID> {
}
