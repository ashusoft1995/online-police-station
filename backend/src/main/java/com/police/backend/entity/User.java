package com.police.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String fullName;
    private String phone;
    private String address;
    
    @Column(nullable = false)
    private String role;
    
    private String badgeNumber;
    private String joinDate;
    private String status = "ACTIVE";
    
    // Comprehensive Profile Fields
    private String profilePictureUrl;
    private String gender;
    private String dateOfBirth;
    private String nationality;
    private String education;
    private String schoolRank;
    private String testResults;
    private String performance;
    private String cvUrl;
    private String workSchedule;
    private String salary;
    private String department;
    private String rank;
    private String experience;
    private String certifications;
    private String emergencyContact;
    private String bloodType;
    private String medicalConditions;
    private String languages;
    
    // Settings/Preferences
    private String preferredLanguage = "en";
    private Boolean emailNotifications = true;
    private Boolean pushNotifications = true;
    private Boolean darkMode = false;
    private String timezone = "UTC";

    private String passwordResetToken;
    private Long passwordResetExpiry;
    
    // Constructors
    public User() {}
    
    public User(String username, String password, String email, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getBadgeNumber() { return badgeNumber; }
    public void setBadgeNumber(String badgeNumber) { this.badgeNumber = badgeNumber; }
    
    public String getJoinDate() { return joinDate; }
    public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // Comprehensive Profile Getters and Setters
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getSchoolRank() { return schoolRank; }
    public void setSchoolRank(String schoolRank) { this.schoolRank = schoolRank; }
    
    public String getTestResults() { return testResults; }
    public void setTestResults(String testResults) { this.testResults = testResults; }
    
    public String getPerformance() { return performance; }
    public void setPerformance(String performance) { this.performance = performance; }
    
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    
    public String getWorkSchedule() { return workSchedule; }
    public void setWorkSchedule(String workSchedule) { this.workSchedule = workSchedule; }
    
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    
    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }
    
    public String getMedicalConditions() { return medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }
    
    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
    
    // Settings/Preferences Getters and Setters
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    
    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    
    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }
    
    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
    
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    @JsonIgnore
    public String getPasswordResetToken() { return passwordResetToken; }
    public void setPasswordResetToken(String passwordResetToken) { this.passwordResetToken = passwordResetToken; }

    @JsonIgnore
    public Long getPasswordResetExpiry() { return passwordResetExpiry; }
    public void setPasswordResetExpiry(Long passwordResetExpiry) { this.passwordResetExpiry = passwordResetExpiry; }
}