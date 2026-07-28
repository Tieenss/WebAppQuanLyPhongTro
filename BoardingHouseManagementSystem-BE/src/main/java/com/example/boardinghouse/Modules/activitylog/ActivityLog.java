package com.example.boardinghouse.Modules.activitylog;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long landlordId;

    @Column(nullable = false)
    private String actionType; // CREATE, UPDATE, DELETE

    @Column(nullable = false)
    private String entityType; // BUILDING, ROOM

    @Column(nullable = false)
    private String description;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
