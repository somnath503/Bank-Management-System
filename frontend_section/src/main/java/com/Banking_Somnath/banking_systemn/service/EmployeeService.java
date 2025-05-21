package com.Banking_Somnath.banking_systemn.service;
import com.Banking_Somnath.banking_systemn.controller.EmployeeController;
import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.Transaction;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
@Service
public class EmployeeService {
    @Autowired
    private TransactionService transactionService;
    private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Helper to find customer (handles finding by ID or potentially Account Number)
    private Optional<Customer> findCustomer(String identifier) {
        // Try finding by Customer ID first
        Optional<Customer> customerOpt = customerRepository.findByCustomerId(identifier);
        if (customerOpt.isEmpty()) {
            // Optional: Add logic to find by Account Number if needed
            // customerOpt = customerRepository.findByAccountNumber(identifier);
        }
        return customerOpt;
    }

    @Transactional
    public String deposit(String targetCustomerId, double amount, String performingEmployeeId) {
        log.info("Employee {} attempting deposit of {} into account for customer ID {}",
                performingEmployeeId, amount, targetCustomerId);

        if (amount <= 0) {
            log.warn("Deposit failed: Amount must be positive. Amount: {}", amount);
            return "ERROR: Amount must be positive.";
        }

        Optional<Customer> targetCustomerOpt = findCustomer(targetCustomerId);
        if (targetCustomerOpt.isEmpty()) {
            log.warn("Deposit failed: Target customer not found with identifier: {}", targetCustomerId);
            return "ERROR: Target customer account not found.";
        }

        Customer targetCustomer = targetCustomerOpt.get();

        // Optional: Check if the target customer account is active/approved
        if (!targetCustomer.isEnabled()) {
            log.warn("Deposit failed: Target customer account {} is not active.", targetCustomerId);
            return "ERROR: Target customer account is not active.";
        }

        // Perform deposit
        targetCustomer.setBalance(targetCustomer.getBalance() + amount);
        customerRepository.save(targetCustomer);
        log.info("Deposit successful. New balance for customer {}: {}", targetCustomerId, targetCustomer.getBalance());

        // Log transaction
        Transaction depositTx = new Transaction();
        depositTx.setCustomerId(targetCustomer.getCustomerId()); // Log against the target customer
        depositTx.setMobileNo(targetCustomer.getMobileNumber());
        depositTx.setType("DEPOSIT_BY_EMP");
        depositTx.setBalance(amount); // Amount deposited
        depositTx.setDescription("Deposit of ₹" + String.format("%.2f", amount) + " performed by Employee " + performingEmployeeId);
        depositTx.setLocalDateTime(LocalDateTime.now());
        depositTx.setSenderAccountNumber(null); // N/A for deposit
        depositTx.setRecipientAccountNumber(targetCustomer.getAccountNumber());
        depositTx.setBranchCode(targetCustomer.getBranchCode());
        depositTx.setIfscCode(targetCustomer.getIfsCode());
        depositTx.setSenderMobileNo(null);
        depositTx.setRecipientMobileNo(targetCustomer.getMobileNumber());
        transactionRepository.save(depositTx);
        log.info("Deposit transaction logged for customer {}", targetCustomerId);

        return "Deposit successful. ₹" + String.format("%.2f", amount) + " added to account " + targetCustomer.getAccountNumber() + ". New balance: ₹" + String.format("%.2f", targetCustomer.getBalance());
    }

    @Transactional
    public String withdraw(String targetCustomerId, double amount, String performingEmployeeId) {
        log.info("Employee {} attempting withdrawal of {} from account for customer ID {}",
                performingEmployeeId, amount, targetCustomerId);

        if (amount <= 0) {
            log.warn("Withdrawal failed: Amount must be positive. Amount: {}", amount);
            return "ERROR: Amount must be positive.";
        }

        Optional<Customer> targetCustomerOpt = findCustomer(targetCustomerId);
        if (targetCustomerOpt.isEmpty()) {
            log.warn("Withdrawal failed: Target customer not found with identifier: {}", targetCustomerId);
            return "ERROR: Target customer account not found.";
        }

        Customer targetCustomer = targetCustomerOpt.get();

        if (!targetCustomer.isEnabled()) {
            log.warn("Withdrawal failed: Target customer account {} is not active.", targetCustomerId);
            return "ERROR: Target customer account is not active.";
        }

        if (targetCustomer.getBalance() < amount) {
            log.warn("Withdrawal failed: Insufficient balance for customer {}. Required: {}, Available: {}",
                    targetCustomerId, amount, targetCustomer.getBalance());
            return "ERROR: Insufficient balance.";
        }

        // Perform withdrawal
        targetCustomer.setBalance(targetCustomer.getBalance() - amount);
        customerRepository.save(targetCustomer);
        log.info("Withdrawal successful. New balance for customer {}: {}", targetCustomerId, targetCustomer.getBalance());

        // Log transaction
        Transaction withdrawalTx = new Transaction();
        withdrawalTx.setCustomerId(targetCustomer.getCustomerId()); // Log against the target customer
        withdrawalTx.setMobileNo(targetCustomer.getMobileNumber());
        withdrawalTx.setType("WITHDRAWAL_BY_EMP");
        withdrawalTx.setBalance(amount); // Amount withdrawn
        withdrawalTx.setDescription("Withdrawal of ₹" + String.format("%.2f", amount) + " performed by Employee " + performingEmployeeId);
        withdrawalTx.setLocalDateTime(LocalDateTime.now());
        withdrawalTx.setSenderAccountNumber(targetCustomer.getAccountNumber());
        withdrawalTx.setRecipientAccountNumber(null); // N/A for withdrawal
        withdrawalTx.setBranchCode(targetCustomer.getBranchCode());
        withdrawalTx.setIfscCode(targetCustomer.getIfsCode());
        withdrawalTx.setSenderMobileNo(targetCustomer.getMobileNumber());
        withdrawalTx.setRecipientMobileNo(null);
        transactionRepository.save(withdrawalTx);
        log.info("Withdrawal transaction logged for customer {}", targetCustomerId);

        return "Withdrawal successful. ₹" + String.format("%.2f", amount) + " deducted from account " + targetCustomer.getAccountNumber() + ". New balance: ₹" + String.format("%.2f", targetCustomer.getBalance());
    }

    @Transactional(readOnly = true) // Read-only is sufficient for checking balance
    public String checkBalance(String targetCustomerId, String performingEmployeeId) {
        log.info("Employee {} checking balance for customer ID {}", performingEmployeeId, targetCustomerId);

        Optional<Customer> targetCustomerOpt = findCustomer(targetCustomerId);
        if (targetCustomerOpt.isEmpty()) {
            log.warn("Check balance failed: Target customer not found with identifier: {}", targetCustomerId);
            return "ERROR: Target customer account not found.";
        }

        Customer targetCustomer = targetCustomerOpt.get();

        // Optionally check if active, though viewing might be allowed even if inactive
        // if (!targetCustomer.isEnabled()) {
        //     log.warn("Check balance: Target customer account {} is not active.", targetCustomerId);
        //     return "ERROR: Target customer account is not active.";
        // }

        log.info("Balance check successful for customer {}. Balance: {}", targetCustomerId, targetCustomer.getBalance());
        return String.format("%.2f", targetCustomer.getBalance());
    }

}