package br.com.starosky.gateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class CustomAuthenticationFilter implements WebFilter {

    @Value("${security.internal-api-key}")
    private String internalAuthSecret;
    @Value("${security.internal-operations-key}")
    private String internalOperationsKey;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String internal = exchange.getRequest().getHeaders().getFirst("X-Internal-Auth");
        if (internal != null) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest()
                .mutate()
                .header("X-Internal-Auth", internalAuthSecret)
                .build();

        // Se for comunicação entre serviços, passa
        String internalOperations = request.getHeaders().getFirst("X-Internal-Operations");
        if (internalOperations != null && internalOperations.equals(internalOperationsKey)) {
            return chain.filter(exchange.mutate().request(request).build());
        }

        // Aqui você pode validar o token (JWT, etc)
        // Se quiser passar informações adiante, adicione no exchange.getAttributes()

        return chain.filter(exchange.mutate().request(request).build());
    }
}

