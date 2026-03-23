package com.police.backend.repository;

import com.police.backend.entity.TrafficAccident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrafficAccidentRepository extends JpaRepository<TrafficAccident, Long> {
}
