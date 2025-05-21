package com.Banking_Somnath.banking_systemn.controller;

import com.Banking_Somnath.banking_systemn.dto.FixedDepositCustomerViewDto;
import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.FixedDeposit;
import com.Banking_Somnath.banking_systemn.model.LoanApplication;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.request.*;
import com.Banking_Somnath.banking_systemn.response.BalanceResponse;
import com.Banking_Somnath.banking_systemn.security.CustomUserDetailsService;
import com.Banking_Somnath.banking_systemn.service.CustomerService;
//import com.Banking_Somnath.banking_systemn.service.TransactionService;
import com.Banking_Somnath.banking_systemn.service.FixedDepositService;
import com.Banking_Somnath.banking_systemn.service.LoanService;
import com.Banking_Somnath.banking_systemn.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
//@CrossOrigin("http://localhost:3000")
// somnath@2004 ->password
public class CustomerController {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationController.class);

    @Autowired
    private FixedDepositService fixedDepositService;

    @Autowired
    CustomerService customerService;

    @Autowired
    TransactionService transactionService;

    @Autowired
    private CustomUserDetailsService userDetailsService; // For loading user data

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    private LoanService loanService;


    @Autowired
    private PasswordEncoder passwordEncoder; // For checking password hash


    @PostMapping("/register")
    public ResponseEntity<Customer> register(@RequestBody Customer customer) {
        Customer registeredCustomer = customerService.register(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredCustomer);
    }

    // --- Part of CustomerController.java ---

    // --- Login endpoint using Manual Authentication Checks ---
    // --- CORRECTED /login endpoint using Manual Authentication Checks & Returning Role/ID ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // --- Basic Request Body Validation ---
        if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Password is required."));
        }
        String identifier = loginRequest.getCustomerId(); // Prioritize customerId
        if ((identifier == null || identifier.isEmpty()) && (loginRequest.getMobileNumber() == null || loginRequest.getMobileNumber().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Either Customer ID or Mobile Number is required."));
        }
        if (identifier == null || identifier.isEmpty()) {
            identifier = loginRequest.getMobileNumber(); // Fallback to mobile
        }
        if (identifier == null || identifier.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Login identifier is required."));
        }

        try {
            // --- Manual Authentication Steps ---

            // 1. Load User by identifier
            UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);

            // 2. Check if account is enabled (isApproved || isAdmin)
            if (!userDetails.isEnabled()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Account is pending admin approval or disabled."));
            }

            // 3. Check if password matches the stored hash
            if (!passwordEncoder.matches(loginRequest.getPassword(), userDetails.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid Credentials.")); // Generic message
            }

            // --- Authentication Successful ---

            // *** FIX: Extract role and customerId for the success response ***
            String role = userDetails.getAuthorities().stream()
                    .findFirst() // Get the first role (e.g., ROLE_ADMIN or ROLE_USER)
                    .map(GrantedAuthority::getAuthority)
                    .orElse("UNKNOWN_ROLE"); // Provide a default if somehow no role is assigned
            // getUsername() from UserDetails is configured to return customerId in Customer.java
            String authenticatedCustomerId = userDetails.getUsername();

            // Return 200 OK success response WITH role and customerId
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful!",
                    "role", role,
                    "customerId", authenticatedCustomerId
            ));
            // *** END FIX ***

        } catch (UsernameNotFoundException e) {
            // User identifier not found
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid Credentials.")); // Generic message
        } catch (Exception e) {
            // Catch any other unexpected errors
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An unexpected error occurred during login: " + e.getMessage()));
        }
    }


    @GetMapping("/check-balance")
    public ResponseEntity<?> checkBalance() {
//         Get the logged-in user's customerId from the SecurityContext
        String customerId = getLoggedInCustomerId();
        System.out.println("Checking balance for: " + customerId);
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String customerId = authentication.getName();
//        System.out.println("Customer ID from security context: " + customerId);


        if (customerId == null) {
            return ResponseEntity.status(401).body("ERROR: User not logged in.");
        }

        // Call service to check balance
        String balance = transactionService.getBalance(customerId);

        if (balance.startsWith("ERROR")) {
            return ResponseEntity.status(404).body(balance);
        }

        return ResponseEntity.ok(new BalanceResponse(true, balance));
    }

    private String getLoggedInCustomerId() {
        // Get the logged-in user (assuming customerId is the username in Spring Security)
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return null;
    }

    @PostMapping("/transfer") // This matches the endpoint your frontend calls
    public ResponseEntity<?> performTransfer(@RequestBody TransferMoney transferRequest) {
        String customerId = getLoggedInCustomerId(); // Get the ID of the logged-in sender

        if (customerId == null) {
            // For an actual application, consider how to provide feedback without server-side logs
            // if direct client feedback is not enough.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new SimpleMessageResponse(false, "User not logged in or session expired. Please login again."));
        }

        // Password field is assumed to be removed from TransferMoney DTO and service logic.
        // No logging of the request body here.

        Optional<Customer> senderOpt = customerRepository.findByCustomerId(customerId);
        if (senderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SimpleMessageResponse(false, "Authenticated user account not found. Please contact support."));
        }

        // Call the transaction service to perform the transfer
        // The transactionService.Transfer method and TransferMoney DTO
        // should also be updated to not expect/use senderPassword.
        String result = transactionService.Transfer(senderOpt.get(), transferRequest);

        // Process the result from the service
        if (result.startsWith("ERROR:")) {
            String errorMessage = result.substring("ERROR:".length()).trim();
            return ResponseEntity.badRequest().body(new SimpleMessageResponse(false, errorMessage));
        }

        return ResponseEntity.ok(new SimpleMessageResponse(true, result));
    }

    // Assuming SimpleMessageResponse class is defined like this, possibly in another file
    // or as a static nested class if only used here.
    public static class SimpleMessageResponse {
        private boolean success;
        private String message;

        public SimpleMessageResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }

    @GetMapping("/transactions/download")
    public ResponseEntity<?> downloadTransactionHistory(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }
        String customerId = principal.getName();
        if (startDate == null || endDate == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Both start date and end date are required.");
        }
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Start date cannot be after end date.");
        }

        try {
            // Call the service method with customerId and the date range
            byte[] pdfBytes = transactionService.generateTransactionHistoryPdf(customerId, startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = String.format("transaction_history_%s_%s_to_%s.pdf",
                    customerId,
                    startDate.toString(),
                    endDate.toString());
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (RuntimeException e) {
            // Catch specific exceptions like customer not found during generation if needed
            e.printStackTrace();
            // Provide a user-friendly error in the body
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating PDF: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate PDF due to an unexpected error.");
        }
    }

    // Simple response class for Transfer endpoint
    public static class SimpleMessage {
        private boolean success;
        private String message;

        public SimpleMessage(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }

    @PostMapping("/loan/apply")
    public ResponseEntity<?> applyForLoan(@RequestBody CreateLoanRequest loanRequest, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "User not authenticated."));
        }
        String customerId = principal.getName(); // Get customerId from authenticated principal
        try {
            LoanApplication createdLoanApp = loanService.applyForLoan(customerId, loanRequest);
            // Return success response with basic details
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Loan application submitted successfully. Awaiting review.",
                    "applicationId", createdLoanApp.getId(),
                    "status", createdLoanApp.getStatus()
            ));
        } catch (IllegalArgumentException e) {
            // Handle validation errors from the service
            log.warn("Loan application validation failed for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            // Handle other errors like customer not found or database issues
            log.error("Error submitting loan application for customer {}: {}", customerId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Error submitting loan application: " + e.getMessage()));
        }
    }

    /**
     * Endpoint for a logged-in customer to view their own loan applications.
     */
    @GetMapping("/loan/my-loans")
    public ResponseEntity<?> getMyLoanApplications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "User not authenticated."));
        }
        String customerId = principal.getName();
        try {
            List<LoanApplication> loanApps = loanService.getLoansByCustomer(customerId);
            return ResponseEntity.ok(Map.of("success", true, "loanApplications", loanApps));
        } catch (RuntimeException e) {
            // Handle errors like customer not found during fetch
            log.error("Error fetching loan applications for customer {}: {}", customerId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Error fetching loan applications: " + e.getMessage()));
        }
    }

    @PostMapping("/fd/apply")
    public ResponseEntity<?> applyForFixedDeposit(@RequestBody CreateFdRequest fdRequest, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("FD Apply attempt by unauthenticated user.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "User not authenticated. Please log in."));
        }
        String customerId = principal.getName();
        log.info("API CALL: Customer '{}' applying for FD. Amount: ₹{}, Term: {} months",
                customerId, fdRequest.getPrincipalAmount(), fdRequest.getTermInMonths());
        try {
            // <<< CORRECTED: Call service method that returns DTO >>>
            FixedDepositCustomerViewDto createdFdDto = fixedDepositService.applyForFd(customerId, fdRequest);
            // The applyForFd service method was already updated to return FixedDepositCustomerViewDto

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Fixed Deposit application submitted successfully. It is now pending admin approval.",
                    "applicationId", createdFdDto.getId(),
                    "principalAmount", createdFdDto.getPrincipalAmount(),
                    "termInMonths", createdFdDto.getTermInMonths(),
                    "interestRate", createdFdDto.getInterestRate(), // Make sure DTO has this if needed here
                    "status", createdFdDto.getStatus()
            ));
        } catch (IllegalArgumentException e) {
            log.warn("FD application validation failed for customer '{}': {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Error during FD application for customer '{}': {}", customerId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "An unexpected error occurred while processing your FD application. Please try again later."));
        }
    }

    // In CustomerController.java
    @GetMapping("/fd/my-fds")
    public ResponseEntity<?> getMyFixedDeposits(Principal principal) {
        // 1. Authentication Check
        if (principal == null || principal.getName() == null) {
            log.warn("API CALL to /fd/my-fds by unauthenticated user.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not authenticated. Please log in to view your Fixed Deposits."));
        }

        String customerId = principal.getName();
        log.info("API CALL: Customer '{}' fetching their Fixed Deposits via /fd/my-fds.", customerId);

        try {
            // 2. Call Service Method that returns a List of DTOs
            // This assumes fixedDepositService.getFdsByCustomerIdDto(customerId) correctly
            // fetches entities and converts them to FixedDepositCustomerViewDto without lazy loading issues.
            List<FixedDepositCustomerViewDto> fdsDtoList = fixedDepositService.getFdsByCustomerIdDto(customerId);

            if (fdsDtoList == null) { // Should not happen if service returns empty list instead of null
                log.error("Service returned null list of FDs for customer '{}'. This is unexpected.", customerId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "An internal error occurred while fetching your Fixed Deposits."));
            }

            log.info("Successfully fetched {} Fixed Deposit DTOs for customer '{}'.", fdsDtoList.size(), customerId);
            // 3. Successful Response with DTO list
            return ResponseEntity.ok(Map.of("success", true, "fixedDeposits", fdsDtoList));

        } catch (RuntimeException e) {
            // This catches exceptions thrown from the service layer,
            // e.g., "Customer not found" or database access issues.
            log.error("Error fetching FDs for customer '{}': {}", customerId, e.getMessage(), e); // Log the full exception for debugging

            String userMessage = "An error occurred while fetching your Fixed Deposits. Please try again later.";
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("customer not found")) {
                // More specific message if customer was not found (should ideally not happen for an authenticated user's own data)
                userMessage = "Could not retrieve your Fixed Deposit details. User profile not found.";
                return ResponseEntity.status(HttpStatus.NOT_FOUND) // Or INTERNAL_SERVER_ERROR
                        .body(Map.of("success", false, "message", userMessage));
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", userMessage));
        }

    }
}