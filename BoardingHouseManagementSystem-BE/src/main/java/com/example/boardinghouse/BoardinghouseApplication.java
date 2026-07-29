package com.example.boardinghouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BoardinghouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardinghouseApplication.class, args);
        System.out.println("====== BOARDING HOUSE ĐANG CHẠY TRÊN PORT 8080 ======");
    }

    @Bean
    public CommandLineRunner databaseFixRunner(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE contracts ALTER COLUMN tenant_id DROP NOT NULL;");
                System.out.println("====== ĐÃ FIX CONSTRAINT DB: tenant_id nullable ======");
            } catch (Exception e) {
                System.out.println("====== KHÔNG CẦN FIX HOẶC LỖI FIX DB: " + e.getMessage());
            }
        };
    }
}
