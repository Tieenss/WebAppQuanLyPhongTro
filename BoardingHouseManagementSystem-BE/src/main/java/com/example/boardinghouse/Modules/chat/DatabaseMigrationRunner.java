package com.example.boardinghouse.Modules.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE conversations DROP COLUMN guest_id");
            System.out.println("Dropped guest_id column from conversations table.");
        } catch (Exception e) {
            System.out.println("guest_id column might have been dropped already.");
        }
        
        try {
            jdbcTemplate.execute("ALTER TABLE conversations DROP COLUMN landlord_id");
            System.out.println("Dropped landlord_id column from conversations table.");
        } catch (Exception e) {
            System.out.println("landlord_id column might have been dropped already.");
        }
    }
}
