package br.com.starosky.gateway.security;

import br.com.starosky.gateway.security.jwt.JwtUtils;
import br.com.starosky.gateway.user.service.UserDetailServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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

    @Autowired
    private UserDetailServiceImpl userService;
    @Autowired
    private JwtUtils jwtUtils;

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

        String token = parseJwt(request);
        if (token != null && jwtUtils.validateJwtToken(token)) {
            String usernameFromToken = jwtUtils.getUsernameFromToken(token);
            UserDetails userDetails = userService.loadUserByUsername(usernameFromToken);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            return chain.filter(exchange.mutate().request(request).build())
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authToken));
        }

        return chain.filter(exchange.mutate().request(request).build());
    }

    private String parseJwt(ServerHttpRequest request) {
        String headerAuth = request.getHeaders().getFirst("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}

