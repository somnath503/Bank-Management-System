package com.Banking_Somnath.banking_systemn.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String applicantFirstName;

    @Column(nullable = false)
    private String applicantLastName;

    @Column(nullable = false, unique = true) // Ensure email is unique for applications? Maybe not.
    private String applicantEmail;

    @Column(nullable = false)
    private String applicantPhone;

    @Lob // For potentially long text
    @Column(columnDefinition = "TEXT")
    private String qualifications;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String experience;

    private String desiredRole;
    private String resumeLink; // Optional link to external resume

    @Column(nullable = false)
    private LocalDateTime applicationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    private String reviewerAdminId; // Customer ID of the admin who reviewed/actioned
    private LocalDateTime interviewDate;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    // --- Constructors ---
    public JobApplication() {
        this.applicationDate = LocalDateTime.now();
        this.status = ApplicationStatus.PENDING;
    }

    // --- Getters and Setters ---
    // (Generate using IDE)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getApplicantFirstName() { return applicantFirstName; }
    public void setApplicantFirstName(String applicantFirstName) { this.applicantFirstName = applicantFirstName; }
    public String getApplicantLastName() { return applicantLastName; }
    public void setApplicantLastName(String applicantLastName) { this.applicantLastName = applicantLastName; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getDesiredRole() { return desiredRole; }
    public void setDesiredRole(String desiredRole) { this.desiredRole = desiredRole; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getReviewerAdminId() { return reviewerAdminId; }
    public void setReviewerAdminId(String reviewerAdminId) { this.reviewerAdminId = reviewerAdminId; }
    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
