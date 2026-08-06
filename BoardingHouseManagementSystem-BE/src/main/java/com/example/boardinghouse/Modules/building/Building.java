package com.example.boardinghouse.Modules.building;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buildings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "landlord_id", nullable = false)
    private Long landlordId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(length = 200)
    private String owner;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String description;
}
