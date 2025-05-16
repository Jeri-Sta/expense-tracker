package br.com.starosky.expensetracker.infra;

import br.com.starosky.expensetracker.model.user.UserDetailsImpl;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return Optional.of(userDetails.getEmail()); // ou seu userId se preferir
    }
}

