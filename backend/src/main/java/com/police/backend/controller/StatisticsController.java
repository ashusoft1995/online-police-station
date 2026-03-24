package com.police.backend.controller;

import com.police.backend.entity.Criminal;
import com.police.backend.entity.User;
import com.police.backend.repository.CriminalRepository;
import com.police.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private CriminalRepository criminalRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Set<String> SOLVED_STATUSES = Set.of("CASE_CLOSED", "Case Closed");
    private static final Set<String> ACTIVE_STATUSES = Set.of("UNDER_INVESTIGATION", "EVIDENCE_COLLECTION", "ARRESTED", "Arrested");

    @GetMapping("/performance")
    public List<Map<String, Object>> getOfficerPerformance() {
        List<Criminal> criminals = criminalRepository.findAll();

        Map<String, Long> solvedByOfficer = criminals.stream()
            .filter(criminal -> SOLVED_STATUSES.contains(criminal.getStatus()))
            .collect(Collectors.groupingBy(
                criminal -> {
                    if (criminal.getReportedBy() != null && !criminal.getReportedBy().isBlank()) {
                        return criminal.getReportedBy();
                    }
                    if (criminal.getReportedByName() != null && !criminal.getReportedByName().isBlank()) {
                        return criminal.getReportedByName();
                    }
                    return "Unknown";
                },
                Collectors.counting()
            ));

        return solvedByOfficer.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
            .limit(5)
            .map(entry -> {
                Map<String, Object> row = new HashMap<>();
                row.put("officerName", entry.getKey());
                row.put("casesSolved", entry.getValue());
                return row;
            })
            .collect(Collectors.toList());
    }

    @GetMapping("/cases")
    public Map<String, Object> getCaseStatistics() {
        List<Criminal> criminals = criminalRepository.findAll();

        long solvedCases = criminals.stream().filter(criminal -> SOLVED_STATUSES.contains(criminal.getStatus())).count();
        long activeCases = criminals.stream().filter(criminal -> ACTIVE_STATUSES.contains(criminal.getStatus())).count();
        long totalCases = criminals.size();
        long pendingCases = Math.max(totalCases - solvedCases - activeCases, 0);

        Map<String, Object> payload = new HashMap<>();
        payload.put("totalCases", totalCases);
        payload.put("solvedCases", solvedCases);
        payload.put("activeCases", activeCases);
        payload.put("pendingCases", pendingCases);

        List<User> users = userRepository.findAll();
        long activeDetectives = users.stream()
            .filter(user -> user.getRole() != null && !"CITIZEN".equalsIgnoreCase(user.getRole()))
            .filter(user -> user.getStatus() == null || !"INACTIVE".equalsIgnoreCase(user.getStatus()))
            .count();
        payload.put("activeDetectives", activeDetectives);

        return payload;
    }

    @GetMapping("/clearance-rate")
    public Map<String, Object> getClearanceRate() {
        List<Criminal> criminals = criminalRepository.findAll();

        long solvedCases = criminals.stream().filter(criminal -> SOLVED_STATUSES.contains(criminal.getStatus())).count();
        long totalCases = criminals.size();
        double clearanceRate = totalCases > 0 ? (double) solvedCases / totalCases * 100.0 : 0.0;

        Map<String, Object> payload = new HashMap<>();
        payload.put("solvedCases", solvedCases);
        payload.put("totalCases", totalCases);
        payload.put("clearanceRate", Math.round(clearanceRate * 100.0) / 100.0);
        return payload;
    }
}
