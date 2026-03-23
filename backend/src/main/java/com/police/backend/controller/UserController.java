package com.police.backend.controller;

import com.police.backend.entity.User;
import com.police.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // Profile Management Endpoints
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> profileData) {
        return userRepository.findById(id)
            .map(user -> {
                // Update profile fields (excluding sensitive data like password)
                if (profileData.containsKey("fullName")) user.setFullName((String) profileData.get("fullName"));
                if (profileData.containsKey("phone")) user.setPhone((String) profileData.get("phone"));
                if (profileData.containsKey("address")) user.setAddress((String) profileData.get("address"));
                if (profileData.containsKey("gender")) user.setGender((String) profileData.get("gender"));
                if (profileData.containsKey("dateOfBirth")) user.setDateOfBirth((String) profileData.get("dateOfBirth"));
                if (profileData.containsKey("nationality")) user.setNationality((String) profileData.get("nationality"));
                if (profileData.containsKey("education")) user.setEducation((String) profileData.get("education"));
                if (profileData.containsKey("schoolRank")) user.setSchoolRank((String) profileData.get("schoolRank"));
                if (profileData.containsKey("testResults")) user.setTestResults((String) profileData.get("testResults"));
                if (profileData.containsKey("performance")) user.setPerformance((String) profileData.get("performance"));
                if (profileData.containsKey("workSchedule")) user.setWorkSchedule((String) profileData.get("workSchedule"));
                if (profileData.containsKey("department")) user.setDepartment((String) profileData.get("department"));
                if (profileData.containsKey("rank")) user.setRank((String) profileData.get("rank"));
                if (profileData.containsKey("experience")) user.setExperience((String) profileData.get("experience"));
                if (profileData.containsKey("certifications")) user.setCertifications((String) profileData.get("certifications"));
                if (profileData.containsKey("emergencyContact")) user.setEmergencyContact((String) profileData.get("emergencyContact"));
                if (profileData.containsKey("bloodType")) user.setBloodType((String) profileData.get("bloodType"));
                if (profileData.containsKey("medicalConditions")) user.setMedicalConditions((String) profileData.get("medicalConditions"));
                if (profileData.containsKey("languages")) user.setLanguages((String) profileData.get("languages"));
                
                userRepository.save(user);
                return ResponseEntity.ok(user);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Settings Management
    @PutMapping("/{id}/settings")
    public ResponseEntity<?> updateSettings(@PathVariable Long id, @RequestBody Map<String, Object> settingsData) {
        return userRepository.findById(id)
            .map(user -> {
                if (settingsData.containsKey("preferredLanguage")) user.setPreferredLanguage((String) settingsData.get("preferredLanguage"));
                if (settingsData.containsKey("emailNotifications")) user.setEmailNotifications((Boolean) settingsData.get("emailNotifications"));
                if (settingsData.containsKey("pushNotifications")) user.setPushNotifications((Boolean) settingsData.get("pushNotifications"));
                if (settingsData.containsKey("darkMode")) user.setDarkMode((Boolean) settingsData.get("darkMode"));
                if (settingsData.containsKey("timezone")) user.setTimezone((String) settingsData.get("timezone"));
                
                userRepository.save(user);
                return ResponseEntity.ok(user);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // File Upload Endpoints
    @PostMapping("/{id}/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return userRepository.findById(id)
            .map(user -> {
                try {
                    String uploadDir = "uploads/profiles";
                    java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                    
                    if (!java.nio.file.Files.exists(uploadPath)) {
                        java.nio.file.Files.createDirectories(uploadPath);
                    }
                    
                    String originalFilename = java.nio.file.Path.of(file.getOriginalFilename()).getFileName().toString();
                    String sanitizedFileName = "profile_" + id + "_" + System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
                    java.nio.file.Path filePath = uploadPath.resolve(sanitizedFileName);
                    java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    
                    user.setProfilePictureUrl("/" + uploadDir + "/" + sanitizedFileName);
                    userRepository.save(user);
                    
                    return ResponseEntity.ok(Map.of("profilePictureUrl", user.getProfilePictureUrl()));
                } catch (Exception e) {
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to upload profile picture: " + e.getMessage()));
                }
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCV(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return userRepository.findById(id)
            .map(user -> {
                try {
                    String uploadDir = "uploads/cvs";
                    java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                    
                    if (!java.nio.file.Files.exists(uploadPath)) {
                        java.nio.file.Files.createDirectories(uploadPath);
                    }
                    
                    String originalFilename = java.nio.file.Path.of(file.getOriginalFilename()).getFileName().toString();
                    String sanitizedFileName = "cv_" + id + "_" + System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
                    java.nio.file.Path filePath = uploadPath.resolve(sanitizedFileName);
                    java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    
                    user.setCvUrl("/" + uploadDir + "/" + sanitizedFileName);
                    userRepository.save(user);
                    
                    return ResponseEntity.ok(Map.of("cvUrl", user.getCvUrl()));
                } catch (Exception e) {
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to upload CV: " + e.getMessage()));
                }
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get user profile (without password)
    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                // Create a profile object without password
                Map<String, Object> profile = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "phone", user.getPhone(),
                    "address", user.getAddress(),
                    "role", user.getRole(),
                    "badgeNumber", user.getBadgeNumber(),
                    "joinDate", user.getJoinDate(),
                    "status", user.getStatus(),
                    "profilePictureUrl", user.getProfilePictureUrl(),
                    "gender", user.getGender(),
                    "dateOfBirth", user.getDateOfBirth(),
                    "nationality", user.getNationality(),
                    "education", user.getEducation(),
                    "schoolRank", user.getSchoolRank(),
                    "testResults", user.getTestResults(),
                    "performance", user.getPerformance(),
                    "cvUrl", user.getCvUrl(),
                    "workSchedule", user.getWorkSchedule(),
                    "salary", user.getSalary(),
                    "department", user.getDepartment(),
                    "rank", user.getRank(),
                    "experience", user.getExperience(),
                    "certifications", user.getCertifications(),
                    "emergencyContact", user.getEmergencyContact(),
                    "bloodType", user.getBloodType(),
                    "medicalConditions", user.getMedicalConditions(),
                    "languages", user.getLanguages(),
                    "preferredLanguage", user.getPreferredLanguage(),
                    "emailNotifications", user.getEmailNotifications(),
                    "pushNotifications", user.getPushNotifications(),
                    "darkMode", user.getDarkMode(),
                    "timezone", user.getTimezone()
                );
                return ResponseEntity.ok(profile);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
