package com.example.boardinghouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BoardinghouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardinghouseApplication.class, args);
        System.out.println("====== BOARDING HOUSE ĐANG CHẠY TRÊN PORT 8080 ======");
    }
}
