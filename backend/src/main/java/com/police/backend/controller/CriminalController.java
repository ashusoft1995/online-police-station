package com.police.backend.controller;

import com.police.backend.entity.Criminal;
import com.police.backend.entity.Notification;
import com.police.backend.repository.CriminalRepository;
import com.police.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/criminals")
@CrossOrigin(origins = "*")
public class CriminalController {

    @Autowired
    private CriminalRepository criminalRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Criminal> getAllCriminals() {
        return criminalRepository.findAll();
    }

    @GetMapping("/detective/{username}")
    public List<Criminal> getCriminalsByDetective(@PathVariable String username) {
        return criminalRepository.findByReportedBy(username);
    }

    @PostMapping
    public Criminal createCriminal(@RequestBody Criminal criminal) {
        Criminal saved = criminalRepository.save(criminal);
        
        // Create notification for Police Head
        Notification notification = new Notification();
        notification.setType("NEW_CRIMINAL");
        notification.setTitle("New Criminal Registered");
        notification.setMessage("Detective " + criminal.getReportedByName() + " registered a new criminal: " + criminal.getName());
        notification.setRelatedId(String.valueOf(saved.getId()));
        notification.setRelatedName(criminal.getName());
        notification.setFromUser(criminal.getReportedBy());
        notification.setFromUserName(criminal.getReportedByName());
        notificationRepository.save(notification);
        
        return saved;
    }

    @PutMapping("/{id}")
    public Criminal updateCriminal(@PathVariable Long id, @RequestBody Criminal criminalDetails) {
        Criminal criminal = criminalRepository.findById(id).orElseThrow();
        criminal.setName(criminalDetails.getName());
        criminal.setCrime(criminalDetails.getCrime());
        criminal.setDescription(criminalDetails.getDescription());
        criminal.setLocation(criminalDetails.getLocation());
        criminal.setCrimeDate(criminalDetails.getCrimeDate());
        criminal.setStatus(criminalDetails.getStatus());
        criminal.setPriority(criminalDetails.getPriority());
        criminal.setEvidence(criminalDetails.getEvidence());
        criminal.setComments(criminalDetails.getComments());
        
        Criminal saved = criminalRepository.save(criminal);
        
        // Create notification for update
        Notification notification = new Notification();
        notification.setType("CASE_UPDATE");
        notification.setTitle("Case Updated");
        notification.setMessage("Case for " + criminal.getName() + " status changed to " + criminal.getStatus());
        notification.setRelatedId(String.valueOf(saved.getId()));
        notification.setRelatedName(criminal.getName());
        notification.setFromUser(criminal.getReportedBy());
        notification.setFromUserName(criminal.getReportedByName());
        notificationRepository.save(notification);
        
        return saved;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCriminal(@PathVariable Long id) {
        Criminal criminal = criminalRepository.findById(id).orElseThrow();
        criminalRepository.deleteById(id);
        
        // Create notification for deletion
        Notification notification = new Notification();
        notification.setType("CASE_DELETED");
        notification.setTitle("Case Deleted");
        notification.setMessage("Case for " + criminal.getName() + " has been deleted");
        notification.setRelatedId(String.valueOf(id));
        notification.setRelatedName(criminal.getName());
        notification.setFromUser(criminal.getReportedBy());
        notification.setFromUserName(criminal.getReportedByName());
        notificationRepository.save(notification);
        
        return ResponseEntity.ok().build();
    }
}