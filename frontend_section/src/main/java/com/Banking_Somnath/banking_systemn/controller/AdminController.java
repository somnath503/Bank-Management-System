package com.Banking_Somnath.banking_systemn.controller;

import com.Banking_Somnath.banking_systemn.dto.FixedDepositAdminViewDto;
import com.Banking_Somnath.banking_systemn.model.*;
import com.Banking_Somnath.banking_systemn.request.ApproveLoanRequest;
import com.Banking_Somnath.banking_systemn.request.RejectApplicationRequest;
import com.Banking_Somnath.banking_systemn.request.RejectRequest;
import com.Banking_Somnath.banking_systemn.request.ScheduleInterviewRequest;
import com.Banking_Somnath.banking_systemn.service.AdminService;
import com.Banking_Somnath.banking_systemn.service.FixedDepositService;
import com.Banking_Somnath.banking_systemn.service.LoanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {


    @Autowired
    private FixedDepositService fixedDepositService;


    private static final Logger log = LoggerFactory.getLogger(JobApplicationController.class);


    @Autowired
    private LoanService loanService;

    @Autowired
    private AdminService adminService;

    @GetMapping("/pending")
    public ResponseEntity<List<Customer>> viewPendingRegistrations() {
        List<Customer> pendingCustomers = adminService.findPendingRegistrations();
        return ResponseEntity.ok(pendingCustomers);
    }

    @PostMapping("/approve/{customerId}")
    public ResponseEntity<String> approveRegistration(@PathVariable String customerId) {
        String result = adminService.approveRegistration(customerId);
        if (result.contains("Customer not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        } else if (result.contains("already approved")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reject/{customerId}")
    public ResponseEntity<String> rejectRegistration(@PathVariable String customerId) {
        String result = adminService.rejectRegistration(customerId);
        if (result.contains("Customer not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
        return ResponseEntity.ok(result);
    }

    // new section for employee

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        List<JobApplication> applications = adminService.getAllJobApplications();
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/{appId}")
    public ResponseEntity<JobApplication> getApplicationDetails(@PathVariable Long appId) {
        return adminService.getJobApplicationDetails(appId)
                .map(ResponseEntity::ok) // If found, wrap in 200 OK
                .orElse(ResponseEntity.notFound().build()); // If not found, return 404
    }

    @PostMapping("/applications/{appId}/schedule-interview")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long appId,
            @RequestBody ScheduleInterviewRequest request, // Use the DTO
            Principal principal) { // Get the logged-in admin
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin user not authenticated.");
        }
        try {
            JobApplication updatedApp = adminService.scheduleJobInterview(appId, request.getInterviewDate(), principal.getName());
            return ResponseEntity.ok(updatedApp);
        } catch (RuntimeException e) {
            // Catch exceptions from service (e.g., app not found)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @PostMapping("/applications/{appId}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long appId,
            @RequestBody RejectApplicationRequest request, // Use the DTO
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin user not authenticated.");
        }
        try {
            JobApplication updatedApp = adminService.rejectJobApplication(appId, request.getReason(), principal.getName());
            return ResponseEntity.ok(updatedApp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @PostMapping("/applications/{appId}/hire")
    public ResponseEntity<?> hireApplicant(
            @PathVariable Long appId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin user not authenticated.");
        }
        try {
            JobApplication updatedApp = adminService.hireApplicant(appId, principal.getName());
            // Maybe return the updated application OR just a success message
            return ResponseEntity.ok(updatedApp); // Returning updated app might be useful
        } catch (RuntimeException e) {
            // Catch specific errors like "already hired" or "email exists"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during hiring process.");
        }
    }

    @GetMapping("/loan/pending")
    public ResponseEntity<List<LoanApplication>> viewPendingLoans() {
        // Consider adding try-catch for robustness, although service might handle
        try {
            List<LoanApplication> pendingLoans = loanService.getPendingLoanApplications();
            return ResponseEntity.ok(pendingLoans);
        } catch (Exception e) {
            log.error("Admin failed to fetch pending loans: {}", e.getMessage(), e);
            // Return an empty list or an error response
            // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
            // For simplicity, rethrowing might be caught by a global handler if configured
            throw new RuntimeException("Failed to fetch pending loans", e);
        }
    }

    /**
     * Endpoint for Admin to approve a specific loan application.
     * Requires loan ID in path and approval details (amount, rate) in body.
     */
    @PostMapping("/loan/approve/{loanId}")
    public ResponseEntity<?> approveLoanApplication(
            @PathVariable Long loanId,
            @RequestBody ApproveLoanRequest approveDetails, // Request body with approved amount/rate
            Principal principal)
    {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Admin not authenticated."));
        }
        String adminId = principal.getName(); // Get adminId from authenticated principal
        try {
            LoanApplication approvedLoan = loanService.approveLoan(loanId, adminId, approveDetails);
            // Return success response with the updated loan application details
            return ResponseEntity.ok(Map.of("success", true, "message", "Loan application " + loanId + " approved successfully.", "loanApplication", approvedLoan));
        } catch (IllegalStateException | IllegalArgumentException e) {
            // Handle cases like wrong status or invalid approval data
            log.warn("Loan approval failed for ID {}: {}", loanId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            // Handle other errors like loan not found or DB issues
            log.error("Error approving loan ID {}: {}", loanId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Error approving loan: " + e.getMessage()));
        }
    }

    /**
     * Endpoint for Admin to reject a specific loan application.
     * Requires loan ID in path and rejection reason in body.
     */
    @PostMapping("/loan/reject/{loanId}")
    public ResponseEntity<?> rejectLoanApplication(
            @PathVariable Long loanId,
            @RequestBody RejectRequest rejectRequest, // Request body with reason
            Principal principal)
    {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Admin not authenticated."));
        }
        String adminId = principal.getName();
        try {
            LoanApplication rejectedLoan = loanService.rejectLoan(loanId, adminId, rejectRequest.getReason());
            // Return success response with the updated loan application details
            return ResponseEntity.ok(Map.of("success", true, "message", "Loan application " + loanId + " rejected successfully.", "loanApplication", rejectedLoan));
        } catch (IllegalStateException | IllegalArgumentException e) {
            // Handle cases like wrong status or missing reason
            log.warn("Loan rejection failed for ID {}: {}", loanId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            // Handle other errors like loan not found or DB issues
            log.error("Error rejecting loan ID {}: {}", loanId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Error rejecting loan: " + e.getMessage()));
        }
    }

    @GetMapping("/fd/pending")
    public ResponseEntity<?> viewPendingFixedDeposits() {
        log.info("ADMIN API CALL: Fetching all pending FD applications.");
        try {
            // <<< CORRECTED: Call service method that returns DTOs >>>
            List<FixedDepositAdminViewDto> pendingFdDtos = fixedDepositService.getPendingFdApplicationsForAdmin();
            return ResponseEntity.ok(pendingFdDtos); // Return list of DTOs
        } catch (Exception e) {
            log.error("Admin error fetching pending FDs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch pending Fixed Deposit applications."));
        }
    }

    /**
     * Endpoint for Admin to approve a specific PENDING Fixed Deposit application.
     * Requires FD ID in the path.
     */
    @PostMapping("/fd/approve/{fdId}")
    public ResponseEntity<?> approveFixedDeposit(@PathVariable Long fdId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("FD Approve attempt by unauthenticated admin.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Admin not authenticated."));
        }
        String adminId = principal.getName();
        log.info("ADMIN API CALL: Admin '{}' attempting to approve FD application ID: {}", adminId, fdId);
        try {
            // <<< CORRECTED: Call service method that returns DTO >>>
            FixedDepositAdminViewDto approvedFdDto = fixedDepositService.approveFd(fdId, adminId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Fixed Deposit application (ID: " + fdId + ") approved successfully and is now active.",
                    "fixedDeposit", approvedFdDto // Send back the DTO
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Admin FD approval validation failed for FD ID {}: {}", fdId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Error during admin approval of FD ID {}: {}", fdId, e.getMessage(), e);
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("insufficient balance")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "An unexpected error occurred while approving the FD: " + e.getMessage()));
        }
    }

    /**
     * Endpoint for Admin to reject a specific PENDING FixedDeposit application.
     * Requires FD ID in path and a rejection reason in the request body.
     */
    @PostMapping("/fd/reject/{fdId}")
    public ResponseEntity<?> rejectFixedDeposit(@PathVariable Long fdId, @RequestBody RejectRequest rejectRequest, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("FD Reject attempt by unauthenticated admin.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Admin not authenticated."));
        }
        String adminId = principal.getName();
        log.info("ADMIN API CALL: Admin '{}' attempting to reject FD application ID: {} with reason: {}",
                adminId, fdId, rejectRequest.getReason());
        try {
            // <<< CORRECTED: Call service method that returns DTO >>>
            FixedDepositAdminViewDto rejectedFdDto = fixedDepositService.rejectFd(fdId, adminId, rejectRequest.getReason());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Fixed Deposit application (ID: " + fdId + ") rejected successfully.",
                    "fixedDeposit", rejectedFdDto // Send back the DTO
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Admin FD rejection validation failed for FD ID {}: {}", fdId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Error during admin rejection of FD ID {}: {}", fdId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "An unexpected error occurred while rejecting the FD: " + e.getMessage()));
        }
    }


}
