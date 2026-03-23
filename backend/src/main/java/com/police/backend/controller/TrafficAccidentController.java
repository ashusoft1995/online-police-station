package com.police.backend.controller;

import com.police.backend.entity.TrafficAccident;
import com.police.backend.repository.TrafficAccidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
