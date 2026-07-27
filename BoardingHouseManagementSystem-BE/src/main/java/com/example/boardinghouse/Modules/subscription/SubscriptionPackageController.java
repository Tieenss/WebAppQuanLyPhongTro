package com.example.boardinghouse.Modules.subscription;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionPackageController {

    private final SubscriptionPackageService service;

    @Autowired
    public SubscriptionPackageController(SubscriptionPackageService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPackage>> getAllPackages() {
        return ResponseEntity.ok(service.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPackageById(id));
    }

    @PostMapping
    public ResponseEntity<SubscriptionPackage> createPackage(@RequestBody SubscriptionPackage packageInfo) {
        return ResponseEntity.ok(service.createPackage(packageInfo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPackage> updatePackage(
            @PathVariable Long id, @RequestBody SubscriptionPackage packageInfo) {
        return ResponseEntity.ok(service.updatePackage(id, packageInfo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        service.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
