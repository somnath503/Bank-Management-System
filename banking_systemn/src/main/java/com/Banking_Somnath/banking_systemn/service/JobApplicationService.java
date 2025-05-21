package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.model.ApplicationStatus;
import com.Banking_Somnath.banking_systemn.model.Employee;
import com.Banking_Somnath.banking_systemn.model.JobApplication;
import com.Banking_Somnath.banking_systemn.repository.JobApplicationRepository;
import com.Banking_Somnath.banking_systemn.request.JobApplicationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {
    @Autowired
    JobApplicationRepository jobApplicationRepository;
    @Autowired
    CustomerService customerService;

    @Transactional
    public JobApplication submitApplication(JobApplicationRequest request) {
        JobApplication application = new JobApplication();
        application.setApplicantFirstName(request.getApplicantFirstName());
        application.setApplicantLastName(request.getApplicantLastName());
        application.setApplicantEmail(request.getApplicantEmail());
        application.setApplicantPhone(request.getApplicantPhone());
        application.setQualifications(request.getQualifications());
        application.setExperience(request.getExperience());
        application.setDesiredRole(request.getDesiredRole());
        application.setResumeLink(request.getResumeLink());
        // applicationDate and status are set in constructor

        return jobApplicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAllByOrderByApplicationDateDesc();
    }

    @Transactional(readOnly = true)
    public Optional<JobApplication> getApplicationById(Long id) {
        return jobApplicationRepository.findById(id);
    }


    @Transactional
    public JobApplication scheduleInterview(Long appId, LocalDateTime interviewDate, String adminId) {
        JobApplication app = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + appId));

        app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        app.setInterviewDate(interviewDate);
        app.setReviewerAdminId(adminId); // Track who scheduled it
        app.setAdminNotes("Interview scheduled by " + adminId + " for " + interviewDate.toString()); // Example note
        return jobApplicationRepository.save(app);
    }

    @Transactional
    public JobApplication rejectApplication(Long appId, String reason, String adminId) {
        JobApplication app = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + appId));

        app.setStatus(ApplicationStatus.REJECTED);
        app.setReviewerAdminId(adminId);
        app.setAdminNotes("Application rejected by " + adminId + ". Reason: " + reason);
        return jobApplicationRepository.save(app);
    }

    // --- Keep previous methods (submitApplication, etc.) AS IS ---

    @Transactional
    public JobApplication approveHire(Long appId, String adminId) {
        JobApplication app = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + appId));

        if(app.getStatus() == ApplicationStatus.HIRED) {
            throw new RuntimeException("Application already marked as hired.");
        }

        String initialPassword = "DefaultPassword123!"; // Keep using the provided password

        // --- START: Minimal Change Area ---
        Employee createdEmployee; // Variable to hold the returned Employee object
        try {
            // Call the CustomerService method which now CREATES and RETURNS an Employee
            // This implicitly uses EmployeeRepository inside CustomerService
            createdEmployee = customerService.createEmployeeFromApplication(app, initialPassword);

        } catch(Exception e) {
            // Keep existing exception handling
            throw new RuntimeException("Failed to create employee user account: " + e.getMessage(), e);
        }
        // --- END: Minimal Change Area ---


        // Update application status only after successful user creation
        app.setStatus(ApplicationStatus.HIRED);
        app.setReviewerAdminId(adminId); // Keep tracking admin

        // *** Update Admin Notes to use the Employee ID from the createdEmployee object ***
        app.setAdminNotes("Hired by " + adminId + ". Employee record created. Employee ID: " + createdEmployee.getEmployeeId()); // Use getEmployeeId()

        // *** This line uses JobApplicationRepository and remains UNCHANGED ***
        // It saves the updated JobApplication entity (app)
        return jobApplicationRepository.save(app);
    }

    // --- Keep other methods AS IS ---
}
