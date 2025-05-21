package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.LoanApplication;
import com.Banking_Somnath.banking_systemn.model.LoanApplicationStatus;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.repository.LoanApplicationRepository;
import com.Banking_Somnath.banking_systemn.request.ApproveLoanRequest;
import com.Banking_Somnath.banking_systemn.request.CreateLoanRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class LoanService {

    private static final Logger log = LoggerFactory.getLogger(LoanService.class);

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private CustomerRepository customerRepository; // Needed to check if customer exists

    // Constants for allowed statuses for admin actions
    private static final List<LoanApplicationStatus> ACTIONABLE_STATUSES = Arrays.asList(
            LoanApplicationStatus.PENDING,
            LoanApplicationStatus.UNDER_REVIEW
    );

    /**
     * Customer applies for a new Loan.
     * Creates a LoanApplication record with PENDING status.
     */
    @Transactional
    public LoanApplication applyForLoan(String customerId, CreateLoanRequest request) {
        log.info("Customer {} applying for {} loan. Amount: {}, Term: {} months",
                customerId, request.getLoanType(), request.getRequestedAmount(), request.getTermInMonths());

        // 1. Ensure customer exists
        customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> {
                    log.error("Loan Application failed: Customer {} not found.", customerId);
                    return new RuntimeException("Customer not found. Cannot apply for loan.");
                });

        // 2. Input Validation (Basic - add more specific checks as needed)
        if (request.getLoanType() == null || request.getLoanType().isBlank()) {
            throw new IllegalArgumentException("Loan type is required.");
        }
        if (request.getRequestedAmount() == null || request.getRequestedAmount() <= 0) {
            throw new IllegalArgumentException("Requested loan amount must be positive.");
        }
        // Example: Check against a minimum loan amount
        if (request.getRequestedAmount() < 1000) {
            throw new IllegalArgumentException("Minimum loan amount is ₹1000.");
        }
        if (request.getTermInMonths() == null || request.getTermInMonths() <= 0) {
            throw new IllegalArgumentException("Loan term must be positive (in months).");
        }
        // Example: Check against allowed terms
        if (request.getTermInMonths() < 6 || request.getTermInMonths() > 120) {
            throw new IllegalArgumentException("Loan term must be between 6 and 120 months.");
        }
        if (request.getPurpose() == null || request.getPurpose().isBlank()) {
            throw new IllegalArgumentException("Loan purpose is required.");
        }
        // Validate optional fields if needed (e.g., income must be non-negative if provided)
        if (request.getMonthlyIncome() != null && request.getMonthlyIncome() < 0) {
            throw new IllegalArgumentException("Monthly income cannot be negative.");
        }


        // 3. Create Loan Application Entity
        LoanApplication loanApp = new LoanApplication();
        loanApp.setCustomerId(customerId);
        loanApp.setLoanType(request.getLoanType().trim().toUpperCase()); // Standardize type
        loanApp.setRequestedAmount(request.getRequestedAmount());
        loanApp.setTermInMonths(request.getTermInMonths());
        loanApp.setPurpose(request.getPurpose().trim());
        loanApp.setMonthlyIncome(request.getMonthlyIncome()); // Optional
        loanApp.setEmploymentStatus(request.getEmploymentStatus()); // Optional
        loanApp.setStatus(LoanApplicationStatus.PENDING); // Initial status
        loanApp.setApplicationDate(LocalDateTime.now());

        // 4. Save and Return
        LoanApplication savedLoanApp = loanApplicationRepository.save(loanApp);
        log.info("Loan Application {} created successfully for customer {} with PENDING status.", savedLoanApp.getId(), customerId);
        return savedLoanApp;
    }

    /**
     * Admin approves a pending Loan application.
     * Updates status to APPROVED, sets approval details.
     * Note: Disbursement is a separate step NOT handled here.
     */
    @Transactional
    public LoanApplication approveLoan(Long loanId, String adminId, ApproveLoanRequest approveDetails) {
        log.info("Admin {} attempting to approve Loan application {}", adminId, loanId);

        // 1. Find the loan application
        LoanApplication loanApp = loanApplicationRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan application not found with ID: " + loanId));

        // 2. Validate current status
        if (!ACTIONABLE_STATUSES.contains(loanApp.getStatus())) {
            log.warn("Approval failed: Loan App {} is not in an actionable status (current: {}).", loanId, loanApp.getStatus());
            throw new IllegalStateException("Loan Application cannot be approved from its current status: " + loanApp.getStatus());
        }

        // 3. Validate Approval Details from Admin
        if (approveDetails.getApprovedAmount() == null || approveDetails.getApprovedAmount() <= 0) {
            throw new IllegalArgumentException("Approved amount must be positive.");
        }
        // Example: Minimum interest rate check
        if (approveDetails.getInterestRate() == null || approveDetails.getInterestRate() <= 0.1) {
            throw new IllegalArgumentException("Interest rate must be positive (e.g., greater than 0.1%).");
        }
        // Optional: Policy check - Approved amount shouldn't drastically exceed requested?
        if (approveDetails.getApprovedAmount() > loanApp.getRequestedAmount() * 1.1) { // e.g., max 10% over requested
            log.warn("Admin {} approved loan {} for significantly more (₹{}) than requested (₹{}).",
                    adminId, loanId, approveDetails.getApprovedAmount(), loanApp.getRequestedAmount());
            // Potentially throw error or just log based on bank policy
        }

        // 4. Update Loan Application Status and Details
        loanApp.setStatus(LoanApplicationStatus.APPROVED);
        loanApp.setApprovedAmount(approveDetails.getApprovedAmount());
        loanApp.setInterestRate(approveDetails.getInterestRate());
        loanApp.setApprovalDate(LocalDateTime.now());
        loanApp.setApprovedByAdminId(adminId); // Log the admin who approved
        loanApp.setRejectionReason(null); // Clear rejection reason if any

        // 5. Save and Return
        LoanApplication approvedLoanApp = loanApplicationRepository.save(loanApp);
        log.info("Loan Application {} approved successfully by admin {}. Approved Amount: ₹{}, Rate: {}%",
                loanId, adminId, approvedLoanApp.getApprovedAmount(), approvedLoanApp.getInterestRate());
        return approvedLoanApp;
    }

    /**
     * Admin rejects a pending Loan application.
     */
    @Transactional
    public LoanApplication rejectLoan(Long loanId, String adminId, String reason) {
        log.info("Admin {} attempting to reject Loan application {} with reason: {}", adminId, loanId, reason);

        // 1. Find the loan application
        LoanApplication loanApp = loanApplicationRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan application not found with ID: " + loanId));

        // 2. Validate current status
        if (!ACTIONABLE_STATUSES.contains(loanApp.getStatus())) {
            log.warn("Rejection failed: Loan App {} is not in an actionable status (current: {}).", loanId, loanApp.getStatus());
            throw new IllegalStateException("Loan Application cannot be rejected from its current status: " + loanApp.getStatus());
        }

        // 3. Validate Rejection Reason
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason cannot be empty.");
        }

        // 4. Update Loan Application Status and Details
        loanApp.setStatus(LoanApplicationStatus.REJECTED);
        loanApp.setApprovedByAdminId(adminId); // Log who rejected it
        loanApp.setRejectionReason(reason.trim());
        // Clear approval details if somehow set previously
        loanApp.setApprovedAmount(null);
        loanApp.setInterestRate(null);
        loanApp.setApprovalDate(null);

        // 5. Save and Return
        LoanApplication rejectedLoanApp = loanApplicationRepository.save(loanApp);
        log.info("Loan Application {} rejected successfully by admin {}.", loanId, adminId);
        return rejectedLoanApp;
    }

    /**
     * Get all Loan Applications for a specific customer.
     */
    @Transactional(readOnly = true)
    public List<LoanApplication> getLoansByCustomer(String customerId) {
        log.debug("Fetching Loan Applications for customer {}", customerId);
        // Ensure customer exists before querying? Optional check.
        customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found. Cannot fetch loans."));
        return loanApplicationRepository.findByCustomerIdOrderByApplicationDateDesc(customerId);
    }

    /**
     * Get all Loan Applications with actionable statuses (PENDING, UNDER_REVIEW) for admin view.
     */
    @Transactional(readOnly = true)
    public List<LoanApplication> getPendingLoanApplications() {
        log.debug("Fetching Loan Applications with actionable statuses: {}", ACTIONABLE_STATUSES);
        return loanApplicationRepository.findByStatusInOrderByApplicationDateAsc(ACTIONABLE_STATUSES);
        // Or if only PENDING:
        // return loanApplicationRepository.findByStatusOrderByApplicationDateAsc(LoanApplicationStatus.PENDING);
    }

    // Optional: Method to get loan by ID if needed elsewhere
    @Transactional(readOnly = true)
    public LoanApplication getLoanApplicationById(Long loanId) {
        log.debug("Fetching loan application by ID: {}", loanId);
        return loanApplicationRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan application not found with ID: " + loanId));
    }
}