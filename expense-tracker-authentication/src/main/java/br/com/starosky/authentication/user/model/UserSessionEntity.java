package br.com.starosky.authentication.user.model;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import java.util.UUID;

@RedisHash("UserSession")
@Data
public class UserSessionEntity {
    @Id
    private UUID id;
    @Indexed
    private String email;
    private String token;
    private String password;
    private String name;
    @TimeToLive
    private Long ttl;
}

