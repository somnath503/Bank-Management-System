package com.Banking_Somnath.banking_systemn.controller;

import com.Banking_Somnath.banking_systemn.model.JobApplication;
import com.Banking_Somnath.banking_systemn.request.JobApplicationRequest;
import com.Banking_Somnath.banking_systemn.service.JobApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; // Add RequestMapping if needed for base path
import org.springframework.web.bind.annotation.RestController;

import java.util.Map; // For simple message responses

@RestController
public class JobApplicationController {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationController.class);

    @Autowired
    private JobApplicationService jobApplicationService;

    // Endpoint for public job application submissions
    @PostMapping("/apply-for-job") // Path matches SecurityConfig permitAll rule
    public ResponseEntity<?> submitJobApplication(
            // Add @Valid here if using validation annotations in the Request DTO
            @RequestBody JobApplicationRequest request
    ) {
        log.info("Received job application submission from email: {}", request.getApplicantEmail());
        try {
            // Basic validation (enhance with @Valid if needed)
            if (request.getApplicantFirstName() == null || request.getApplicantFirstName().isBlank() ||
                    request.getApplicantLastName() == null || request.getApplicantLastName().isBlank() ||
                    request.getApplicantEmail() == null || request.getApplicantEmail().isBlank() ||
                    request.getApplicantPhone() == null || request.getApplicantPhone().isBlank() ||
                    request.getQualifications() == null || request.getQualifications().isBlank() ||
                    request.getDesiredRole() == null || request.getDesiredRole().isBlank()) {
                log.warn("Job application validation failed: Missing required fields.");
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please fill in all required fields."));
            }

            JobApplication submittedApplication = jobApplicationService.submitApplication(request);
            log.info("Job application submitted successfully with ID: {}", submittedApplication.getId());

            // Return a simple success message
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Application submitted successfully!"
                    // "applicationId": submittedApplication.getId() // Optional: return ID
            ));

        } catch (Exception e) {
            log.error("Error submitting job application for email {}: {}", request.getApplicantEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "An error occurred while submitting your application."));
        }
    }
}