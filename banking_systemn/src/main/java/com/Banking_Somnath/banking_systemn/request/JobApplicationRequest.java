package com.Banking_Somnath.banking_systemn.request;

public class JobApplicationRequest {

    // Use validation annotations if you add the dependency: spring-boot-starter-validation
    // @NotBlank(message = "First name is required")
    private String applicantFirstName;

    // @NotBlank(message = "Last name is required")
    private String applicantLastName;

    // @NotBlank(message = "Email is required")
    // @Email(message = "Invalid email format")
    private String applicantEmail;

    // @NotBlank(message = "Phone number is required")
    // @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits") // Adjust size as needed
    private String applicantPhone;

    // @NotBlank(message = "Qualifications are required")
    private String qualifications; // Can be a longer text description

    private String experience; // Optional field, can be longer text

    // @NotBlank(message = "Desired role is required")
    private String desiredRole;

    private String resumeLink; // Optional link to an online resume (e.g., LinkedIn, Google Drive)

    // --- Default Constructor (Needed for frameworks like Jackson) ---
    public JobApplicationRequest() {
    }

    // --- Getters ---
    public String getApplicantFirstName() {
        return applicantFirstName;
    }

    public String getApplicantLastName() {
        return applicantLastName;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public String getQualifications() {
        return qualifications;
    }

    public String getExperience() {
        return experience;
    }

    public String getDesiredRole() {
        return desiredRole;
    }

    public String getResumeLink() {
        return resumeLink;
    }

    // --- Setters ---
    public void setApplicantFirstName(String applicantFirstName) {
        this.applicantFirstName = applicantFirstName;
    }

    public void setApplicantLastName(String applicantLastName) {
        this.applicantLastName = applicantLastName;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public void setDesiredRole(String desiredRole) {
        this.desiredRole = desiredRole;
    }

    public void setResumeLink(String resumeLink) {
        this.resumeLink = resumeLink;
    }
}