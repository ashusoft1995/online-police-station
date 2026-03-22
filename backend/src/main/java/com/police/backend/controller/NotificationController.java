package com.police.backend.controller;

import com.police.backend.entity.Notification;
import com.police.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByReadFalse();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        notification.setRead(false);
        return notificationRepository.save(notification);
    }
}