package com.police.backend.controller;

import com.police.backend.entity.Report;
import com.police.backend.entity.Notification;
import com.police.backend.repository.ReportRepository;
import com.police.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private NotificationRepository notificationRepository;

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

    // Report Management Endpoints
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, Object> statusData) {
        return reportRepository.findById(id)
            .map(report -> {
                if (statusData.containsKey("status")) report.setStatus((String) statusData.get("status"));
                if (statusData.containsKey("priority")) report.setPriority((String) statusData.get("priority"));
                if (statusData.containsKey("assignedOfficerId")) report.setAssignedOfficerId(Long.valueOf(statusData.get("assignedOfficerId").toString()));
                if (statusData.containsKey("assignedOfficerName")) report.setAssignedOfficerName((String) statusData.get("assignedOfficerName"));
                if (statusData.containsKey("internalNotes")) report.setInternalNotes((String) statusData.get("internalNotes"));
                
                reportRepository.save(report);
                return ResponseEntity.ok(report);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToReport(@PathVariable Long id, @RequestBody Map<String, Object> replyData) {
        return reportRepository.findById(id)
            .map(report -> {
                report.setReply((String) replyData.get("reply"));
                report.setReplyBy((String) replyData.get("replyBy"));
                report.setReplyDate(java.time.LocalDateTime.now());
                report.setStatus("REPLIED");
                
                reportRepository.save(report);
                
                // Create notification for the reply
                try {
                    Notification notification = new Notification();
                    notification.setType("REPORT_REPLY");
                    notification.setTitle("Report Reply");
                    notification.setMessage("Your report has been replied to by " + replyData.get("replyBy"));
                    notification.setRelatedId(String.valueOf(id));
                    notification.setRelatedName("Report #" + id);
                    notificationRepository.save(notification);
                } catch (Exception e) {
                    // Log error but don't fail the reply
                    System.err.println("Failed to create notification: " + e.getMessage());
                }
                
                return ResponseEntity.ok(report);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getReportDetails(@PathVariable Long id) {
        return reportRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
