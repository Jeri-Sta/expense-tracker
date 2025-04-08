package br.com.starosky.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class ExpenseTrackerEurekaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseTrackerEurekaServerApplication.class, args);
	}

}
