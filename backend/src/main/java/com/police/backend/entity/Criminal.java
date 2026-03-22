package com.police.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "criminals")
public class Criminal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String alias;
    private String crime;
    private String description;
    private String location;
    
    @Column(name = "crime_date")
    private String crimeDate;
    
    private String status; // UNDER_INVESTIGATION, EVIDENCE_COLLECTION, ARRESTED, CASE_CLOSED
    private String priority; // HIGH, MEDIUM, LOW
    private String evidence;
    private String comments;
    
    @Column(name = "reported_by")
    private String reportedBy; // username of detective
    
    @Column(name = "reported_by_name")
    private String reportedByName;
    
    @Column(name = "detective_badge")
    private String detectiveBadge;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public Criminal() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    
    public String getCrime() { return crime; }
    public void setCrime(String crime) { this.crime = crime; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getCrimeDate() { return crimeDate; }
    public void setCrimeDate(String crimeDate) { this.crimeDate = crimeDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    
    public String getReportedByName() { return reportedByName; }
    public void setReportedByName(String reportedByName) { this.reportedByName = reportedByName; }
    
    public String getDetectiveBadge() { return detectiveBadge; }
    public void setDetectiveBadge(String detectiveBadge) { this.detectiveBadge = detectiveBadge; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}