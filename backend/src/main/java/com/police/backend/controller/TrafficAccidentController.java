package com.police.backend.controller;

import com.police.backend.entity.TrafficAccident;
import com.police.backend.repository.TrafficAccidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traffic/accidents")
@CrossOrigin(origins = "*")
public class TrafficAccidentController {

    @Autowired
    private TrafficAccidentRepository trafficAccidentRepository;

    @GetMapping
    public List<TrafficAccident> getAllAccidents() {
        return trafficAccidentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createAccident(@RequestBody TrafficAccident accident) {
        if (accident.getStatus() == null || accident.getStatus().isEmpty()) {
            accident.setStatus("REPORTED");
        }
        TrafficAccident saved = trafficAccidentRepository.save(accident);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAccidentStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return trafficAccidentRepository.findById(id)
            .map(accident -> {
                String status = payload.get("status") != null ? payload.get("status").toString() : null;
                if (status == null || status.isBlank()) {
                    return ResponseEntity.badRequest().body("Status is required");
                }
                accident.setStatus(status);
                trafficAccidentRepository.save(accident);
                return ResponseEntity.ok(accident);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
