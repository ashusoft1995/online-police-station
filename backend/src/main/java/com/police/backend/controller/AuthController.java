package com.police.backend.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.police.backend.entity.User;
import com.police.backend.repository.UserRepository;
import com.police.backend.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Value("${app.dev.expose-reset-token:false}")
    private boolean exposeResetToken;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        User user = userOptional.get();

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus() != null ? user.getStatus() : "ACTIVE")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Account is not active"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
        }

        String token = jwtService.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());
        response.put("badgeNumber", user.getBadgeNumber());
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (userRepository.findByEmailIgnoreCase(user.getEmail().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        String role = user.getRole();
        if (role != null && "POLICE_HEAD".equalsIgnoreCase(role)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Police Head registration is not available on this form"));
        }
        if (role == null || role.isBlank()) {
            user.setRole("DETECTIVE");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null || user.getStatus().isBlank()) {
            user.setStatus("ACTIVE");
        }

        User saved = userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("username", saved.getUsername());
        res.put("email", saved.getEmail());
        res.put("fullName", saved.getFullName());
        res.put("role", saved.getRole());
        res.put("badgeNumber", saved.getBadgeNumber());
        res.put("message", "Registration successful");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(userOptional.get());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Optional<User> opt = userRepository.findByEmailIgnoreCase(email.trim());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "If an account exists for that email, reset instructions have been processed.");

        if (opt.isEmpty()) {
            return ResponseEntity.ok(response);
        }

        User u = opt.get();
        String token = UUID.randomUUID().toString().replace("-", "");
        u.setPasswordResetToken(token);
        u.setPasswordResetExpiry(System.currentTimeMillis() + 60L * 60L * 1000L);
        userRepository.save(u);

        log.info("Password reset requested for {} — token valid 60m (configure mail or use dev token)", email);
        log.info("DEV reset token for {}: {}", email, token);

        if (exposeResetToken) {
            response.put("devResetToken", token);
            response.put("devNote", "Shown only when app.dev.expose-reset-token=true. Use POST /api/auth/reset-password.");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        Optional<User> opt = userRepository.findByPasswordResetToken(token.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset token"));
        }
        User u = opt.get();
        if (u.getPasswordResetExpiry() == null || u.getPasswordResetExpiry() < System.currentTimeMillis()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset token"));
        }

        u.setPassword(passwordEncoder.encode(newPassword));
        u.setPasswordResetToken(null);
        u.setPasswordResetExpiry(null);
        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "Password updated. You can sign in."));
    }
}
