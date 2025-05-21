package com.Banking_Somnath.banking_systemn.controller;

import com.Banking_Somnath.banking_systemn.request.EmployeeActionRequest; // Assuming a combined request DTO
import com.Banking_Somnath.banking_systemn.response.BalanceResponse; // Can reuse this
import com.Banking_Somnath.banking_systemn.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.security.Principal; // To get the logged-in employee/admin ID
import java.util.Map;

@RestController
@RequestMapping("/employee") // Base path for all employee actions
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Helper to get the logged-in username (employee/admin customerId)
    private String getPerformingUsername(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new SecurityException("User not authenticated."); // Should be caught by Spring Security ideally
        }
        return principal.getName();
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> performDeposit(@RequestBody EmployeeActionRequest request, Principal principal) {
        try {
            String performingUsername = getPerformingUsername(principal);
            String result = employeeService.deposit(request.getTargetCustomerId(), request.getAmount(), performingUsername);

            if (result.startsWith("ERROR:")) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", result.replace("ERROR: ", "")));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An unexpected error occurred during deposit."));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> performWithdrawal(@RequestBody EmployeeActionRequest request, Principal principal) {
        try {
            String performingUsername = getPerformingUsername(principal);
            String result = employeeService.withdraw(request.getTargetCustomerId(), request.getAmount(), performingUsername);

            if (result.startsWith("ERROR:")) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", result.replace("ERROR: ", "")));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An unexpected error occurred during withdrawal."));
        }
    }

    @GetMapping("/check-balance/{targetCustomerId}")
    public ResponseEntity<?> checkCustomerBalance(@PathVariable String targetCustomerId, Principal principal) {
        try {
            String performingUsername = getPerformingUsername(principal);
            String balance = employeeService.checkBalance(targetCustomerId, performingUsername);

            if (balance.startsWith("ERROR:")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", balance.replace("ERROR: ", "")));
            }
            // Reuse BalanceResponse or return a map
            return ResponseEntity.ok(new BalanceResponse(true, balance));
            // return ResponseEntity.ok(Map.of("success", true, "customerId", targetCustomerId, "balance", balance));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An unexpected error occurred checking balance."));
        }
    }

}