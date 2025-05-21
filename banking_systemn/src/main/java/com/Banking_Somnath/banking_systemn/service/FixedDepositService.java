package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.dto.CustomerBasicInfoDto;
import com.Banking_Somnath.banking_systemn.dto.FixedDepositAdminViewDto;
import com.Banking_Somnath.banking_systemn.dto.FixedDepositCustomerViewDto;
import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.FixedDeposit;
import com.Banking_Somnath.banking_systemn.model.FixedDepositStatus;
import com.Banking_Somnath.banking_systemn.model.Transaction;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.repository.FixedDepositRepository;
import com.Banking_Somnath.banking_systemn.repository.TransactionRepository;
import com.Banking_Somnath.banking_systemn.request.CreateFdRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// import org.hibernate.Hibernate; // Only if explicitly using Hibernate.initialize and not JOIN FETCH

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FixedDepositService {

    private static final Logger log = LoggerFactory.getLogger(FixedDepositService.class);

    @Autowired
    private FixedDepositRepository fixedDepositRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // --- Interest Rates ---
    private static final double RATE_FOR_TERM_1_TO_6_MONTHS = 5.0;
    private static final double RATE_FOR_TERM_7_TO_12_MONTHS = 5.75;
    private static final double RATE_FOR_TERM_13_TO_24_MONTHS = 6.25;
    private static final double RATE_FOR_TERM_25_TO_60_MONTHS = 6.75;
    private static final double RATE_FOR_TERM_ABOVE_60_MONTHS = 7.0;

    /**
     * Customer applies for a new Fixed Deposit.
     * Returns a DTO representing the created (pending) FD application.
     */
    @Transactional
    public FixedDepositCustomerViewDto applyForFd(String customerId, CreateFdRequest request) {
        log.info("Customer {} initiating FD application. Amount: ₹{}, Term: {} months",
                customerId, request.getPrincipalAmount(), request.getTermInMonths());

        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> {
                    log.error("FD Application failed: Customer with ID {} not found.", customerId);
                    return new RuntimeException("Customer not found. Unable to process FD application.");
                });

        // --- Input Validation ---
        if (request.getPrincipalAmount() == null || request.getPrincipalAmount() <= 0) {
            throw new IllegalArgumentException("Principal amount for FD must be a positive value.");
        }
        if (request.getPrincipalAmount() < 500.00) {
            throw new IllegalArgumentException("Minimum Fixed Deposit amount is ₹500.00.");
        }
        if (request.getTermInMonths() == null || request.getTermInMonths() <= 0) {
            throw new IllegalArgumentException("Term in months for FD must be a positive value.");
        }
        if (request.getTermInMonths() < 1 || request.getTermInMonths() > 120) {
            throw new IllegalArgumentException("Fixed Deposit term must be between 1 and 120 months.");
        }

        double interestRate = determineInterestRateForTerm(request.getTermInMonths());

        FixedDeposit fd = new FixedDeposit();
        fd.setCustomer(customer);
        fd.setCustomerId(customerId);
        fd.setPrincipalAmount(roundToTwoDecimals(request.getPrincipalAmount()));
        fd.setTermInMonths(request.getTermInMonths());
        fd.setInterestRate(interestRate);
        fd.setSourceAccountNumber(customer.getAccountNumber());
        fd.setStatus(FixedDepositStatus.PENDING);
        fd.setApplicationDate(LocalDateTime.now());
        // Maturity date & amount for PENDING can be indicative if needed by DTO,
        // but official calculation happens on approval based on actual start date.
        // For PENDING, startDate, maturityDate, maturityAmount are often null in the DTO.
        // fd.setMaturityDate(LocalDate.now().plusMonths(fd.getTermInMonths())); // Tentative
        // fd.setMaturityAmount(calculateMaturityAmount(fd.getPrincipalAmount(), fd.getInterestRate(), fd.getTermInMonths())); // Tentative


        FixedDeposit savedFd = fixedDepositRepository.save(fd);
        log.info("FD Application (ID: {}) created successfully for customer {} with PENDING status. Proposed rate: {}% p.a.",
                savedFd.getId(), customerId, interestRate);
        return convertToCustomerViewDto(savedFd); // Return DTO for consistency
    }

    /**
     * Admin approves a pending Fixed Deposit application.
     * Returns an AdminViewDTO of the approved FD.
     */
    @Transactional
    public FixedDepositAdminViewDto approveFd(Long fdId, String adminId) {
        log.info("Admin {} attempting to approve FD application ID: {}", adminId, fdId);

        // Use a repository method that ensures customer is fetched if LAZY for balance check.
        // findById should work if Customer association in FixedDeposit is EAGER.
        // If LAZY, prefer custom findByIdWithCustomer(fdId) from repository with JOIN FETCH.
        FixedDeposit fd = fixedDepositRepository.findById(fdId)
                .orElseThrow(() -> new RuntimeException("Fixed Deposit application not found with ID: " + fdId));

        if (fd.getStatus() != FixedDepositStatus.PENDING) {
            log.warn("FD Approval failed for ID {}: Application is not in PENDING status (current: {}).", fdId, fd.getStatus());
            throw new IllegalStateException("Only Fixed Deposits with PENDING status can be approved.");
        }

        Customer customer = fd.getCustomer();
        if (customer == null) { // Should be loaded if association is EAGER or JOIN FETCHED
            customer = customerRepository.findByCustomerId(fd.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Critical Error: Customer (ID: " + fd.getCustomerId() + ") for FD ID " + fdId + " not found."));
            fd.setCustomer(customer); // Associate if fetched separately
        }
        // If Customer is LAZY and not JOIN FETCHED, ensure it's initialized before accessing balance
        // if (!org.hibernate.Hibernate.isInitialized(customer)) {
        //     org.hibernate.Hibernate.initialize(customer);
        // }

        if (customer.getBalance() < fd.getPrincipalAmount()) {
            throw new RuntimeException("Insufficient balance in customer's account (ID: "
                    + customer.getCustomerId() + ") to fund the Fixed Deposit of ₹" + fd.getPrincipalAmount() + ".");
        }

        customer.setBalance(roundToTwoDecimals(customer.getBalance() - fd.getPrincipalAmount()));
        customerRepository.save(customer);
        log.info("Successfully debited ₹{} from customer {} (Account: {}) for FD ID {}. New balance: ₹{}",
                fd.getPrincipalAmount(), customer.getCustomerId(), customer.getAccountNumber(), fdId, customer.getBalance());

        Transaction debitTransaction = new Transaction();
        debitTransaction.setCustomerId(customer.getCustomerId());
        debitTransaction.setMobileNo(customer.getMobileNumber());
        debitTransaction.setType("FD_ACCOUNT_DEBIT");
        debitTransaction.setBalance(fd.getPrincipalAmount());
        debitTransaction.setDescription("Debit for activation of Fixed Deposit (ID: " + fd.getId() + ")");
        debitTransaction.setLocalDateTime(LocalDateTime.now());
        debitTransaction.setSenderAccountNumber(customer.getAccountNumber());
        debitTransaction.setBranchCode(customer.getBranchCode());
        debitTransaction.setIfscCode(customer.getIfsCode());
        transactionRepository.save(debitTransaction);
        log.info("FD debit transaction logged successfully for FD ID: {}", fd.getId());

        LocalDate actualStartDate = LocalDate.now();
        fd.setStartDate(actualStartDate);
        fd.setMaturityDate(actualStartDate.plusMonths(fd.getTermInMonths()));
        fd.setMaturityAmount(calculateMaturityAmount(fd.getPrincipalAmount(), fd.getInterestRate(), fd.getTermInMonths()));
        fd.setStatus(FixedDepositStatus.ACTIVE);
        fd.setActionDate(LocalDateTime.now());
        fd.setActionByAdminId(adminId);
        fd.setRejectionReason(null);

        FixedDeposit approvedFd = fixedDepositRepository.save(fd);
        return convertToAdminViewDto(approvedFd);
    }

    /**
     * Admin rejects a pending Fixed Deposit application.
     * Returns an AdminViewDTO of the rejected FD.
     */
    @Transactional
    public FixedDepositAdminViewDto rejectFd(Long fdId, String adminId, String reason) {
        log.info("Admin {} attempting to reject FD application ID: {} with reason: {}", adminId, fdId, reason);
        FixedDeposit fd = fixedDepositRepository.findById(fdId)
                .orElseThrow(() -> new RuntimeException("Fixed Deposit application not found with ID: " + fdId));

        if (fd.getStatus() != FixedDepositStatus.PENDING) {
            log.warn("FD Rejection failed for ID {}: Application is not in PENDING status (current: {}).", fdId, fd.getStatus());
            throw new IllegalStateException("Only Fixed Deposits with PENDING status can be rejected.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason cannot be empty.");
        }
        if (reason.length() > 500) {
            throw new IllegalArgumentException("Rejection reason is too long (max 500 characters).");
        }

        fd.setStatus(FixedDepositStatus.REJECTED);
        fd.setActionDate(LocalDateTime.now());
        fd.setActionByAdminId(adminId);
        fd.setRejectionReason(reason.trim());
        // Ensure customer is loaded for DTO conversion, if not already by findById
        if (fd.getCustomer() == null) {
            customerRepository.findByCustomerId(fd.getCustomerId()).ifPresent(fd::setCustomer);
        }


        FixedDeposit rejectedFd = fixedDepositRepository.save(fd);
        return convertToAdminViewDto(rejectedFd);
    }

    /**
     * Retrieves all Fixed Deposits for a specific customer as DTOs.
     */
    @Transactional(readOnly = true)
    public List<FixedDepositCustomerViewDto> getFdsByCustomerIdDto(String customerId) {
        log.debug("Fetching all FDs for customer ID {} as DTOs", customerId);
        customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found. Cannot fetch FDs."));

        // FIXED: Removed the incorrect line and duplicate assignment.
        // List<FixedDeposit> fds = fixedDepositRepository.findByStatusWithCustomerOrderByApplicationDateAsc(FixedDepositStatus.valueOf(customerId)); // <<< THIS LINE WAS THE PROBLEM AND IS REMOVED
        // CORRECTED: Use the new repository method (ensure this method exists in FixedDepositRepository)
        List<FixedDeposit> fds = fixedDepositRepository.findByCustomerIdWithCustomerOrderByApplicationDateDesc(customerId);
        return fds.stream().map(this::convertToCustomerViewDto).collect(Collectors.toList());
    }

    /**
     * Retrieves PENDING Fixed Deposit applications as DTOs for admin view.
     * This method now uses the repository method with JOIN FETCH to ensure customer details are loaded.
     */
    @Transactional(readOnly = true)
    public List<FixedDepositAdminViewDto> getPendingFdApplicationsForAdmin() {
        log.debug("Fetching PENDING FD applications for Admin View DTOs");
        List<FixedDeposit> pendingFds = fixedDepositRepository.findByStatusWithCustomerOrderByApplicationDateAsc(FixedDepositStatus.PENDING);
        return pendingFds.stream()
                .map(this::convertToAdminViewDto)
                .collect(Collectors.toList());
    }

    // --- DTO Conversion Helpers ---
    private FixedDepositAdminViewDto convertToAdminViewDto(FixedDeposit fd) {
        if (fd == null) return null;
        Customer customer = fd.getCustomer(); // Expected to be initialized due to JOIN FETCH or EAGER loading
        CustomerBasicInfoDto customerInfoDto;

        if (customer != null) {
            customerInfoDto = new CustomerBasicInfoDto(
                    customer.getCustomerId(),
                    customer.getFname() + " " + customer.getLname(),
                    customer.getMobileNumber(),
                    customer.getEmail()
            );
        } else {
            log.warn("Customer object was null for FD ID: {}. Using customerId from FD for DTO.", fd.getId());
            // Attempt a fallback, though this indicates a potential issue in data loading strategy
            Customer fallbackCustomer = customerRepository.findByCustomerId(fd.getCustomerId()).orElse(null);
            if (fallbackCustomer != null) {
                customerInfoDto = new CustomerBasicInfoDto(
                        fallbackCustomer.getCustomerId(),
                        fallbackCustomer.getFname() + " " + fallbackCustomer.getLname(),
                        fallbackCustomer.getMobileNumber(),
                        fallbackCustomer.getEmail()
                );
            } else {
                customerInfoDto = new CustomerBasicInfoDto(fd.getCustomerId(), "Customer Data Unavailable", "N/A", "N/A");
            }
        }

        return new FixedDepositAdminViewDto(
                fd.getId(),
                customerInfoDto,
                fd.getPrincipalAmount(),
                fd.getTermInMonths(),
                fd.getInterestRate(),
                fd.getApplicationDate(),
                fd.getStatus(),
                fd.getSourceAccountNumber()
        );
    }

    private FixedDepositCustomerViewDto convertToCustomerViewDto(FixedDeposit fd) {
        if (fd == null) return null;
        return new FixedDepositCustomerViewDto(
                fd.getId(),
                fd.getPrincipalAmount(),
                fd.getInterestRate(),
                fd.getTermInMonths(),
                fd.getStartDate(), // Will be null for PENDING/REJECTED
                fd.getMaturityDate(), // Will be null for PENDING/REJECTED, or based on app date if PENDING
                fd.getMaturityAmount(), // Will be null for PENDING/REJECTED
                fd.getStatus(),
                fd.getApplicationDate(),
                fd.getSourceAccountNumber(), // Corrected order
                fd.getRejectionReason(),     // Corrected order
                fd.getActionDate()           // Added for DTO's approvalDate field
        );
    }

    // --- Private Helper Methods for Calculations ---
    private double determineInterestRateForTerm(int termInMonths) {
        if (termInMonths > 60) return RATE_FOR_TERM_ABOVE_60_MONTHS;
        if (termInMonths >= 25) return RATE_FOR_TERM_25_TO_60_MONTHS;
        if (termInMonths >= 13) return RATE_FOR_TERM_13_TO_24_MONTHS;
        if (termInMonths >= 7) return RATE_FOR_TERM_7_TO_12_MONTHS;
        if (termInMonths >= 1) return RATE_FOR_TERM_1_TO_6_MONTHS;
        log.warn("Unsupported FD term for rate calculation: {} months. Returning lowest tier rate.", termInMonths);
        return RATE_FOR_TERM_1_TO_6_MONTHS;
    }

    private double calculateMaturityAmount(double principal, double annualRatePercent, int termInMonths) {
        double rateDecimal = annualRatePercent / 100.0;
        double termInYears = (double) termInMonths / 12.0;
        // Simple Interest: Interest = P * R * T; Maturity = P + Interest
        double interestEarned = principal * rateDecimal * termInYears;
        double maturityAmount = principal + interestEarned;
        return roundToTwoDecimals(maturityAmount);
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}