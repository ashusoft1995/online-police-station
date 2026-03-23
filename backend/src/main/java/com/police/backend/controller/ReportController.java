package com.police.backend.controller;

import com.police.backend.entity.Report;
import com.police.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createReport(
            @RequestParam String incidentType,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam String date,
            @RequestParam Boolean anonymous,
            @RequestParam(required = false) MultipartFile evidenceFile
    ) {
        Report report = new Report();
        report.setIncidentType(incidentType);
        report.setLocation(location);
        report.setDescription(description);
        report.setDate(date);
        report.setAnonymous(anonymous);

        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            try {
                String uploadDir = "uploads"; // relative to project root / working directory
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);

                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }

                String originalFilename = java.nio.file.Path.of(evidenceFile.getOriginalFilename()).getFileName().toString();
                String sanitizedFileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
                java.nio.file.Path filePath = uploadPath.resolve(sanitizedFileName);
                java.nio.file.Files.copy(evidenceFile.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                report.setEvidenceUrl("/" + uploadDir + "/" + sanitizedFileName);
            } catch (Exception ex) {
                return ResponseEntity.status(500).body("Failed to save evidence file: " + ex.getMessage());
            }
        }

        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(saved);
    }
}
