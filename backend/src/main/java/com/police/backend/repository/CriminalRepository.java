package com.police.backend.repository;

import com.police.backend.entity.Criminal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CriminalRepository extends JpaRepository<Criminal, Long> {
    List<Criminal> findByReportedBy(String reportedBy);
    List<Criminal> findByStatus(String status);
}