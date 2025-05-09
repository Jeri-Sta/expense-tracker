package br.com.starosky.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication
public class ExpenseTrackerGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseTrackerGatewayApplication.class, args);
	}

}
