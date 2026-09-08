package com.dibladi.dibladibackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync  // Active l'envoi asynchrone des emails (@Async dans EmailService)
public class DiblaDiBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiblaDiBackendApplication.class, args);
    }
}
