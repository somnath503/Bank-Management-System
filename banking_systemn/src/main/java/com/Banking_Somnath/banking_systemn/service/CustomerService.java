package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.model.Employee;
import com.Banking_Somnath.banking_systemn.model.JobApplication;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.repository.EmployeeRepository;
import com.Banking_Somnath.banking_systemn.request.LoginRequest;
import com.Banking_Somnath.banking_systemn.model.Customer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomerService {


    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);
    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    PasswordEncoder passwordEncoder; // <<< Autowire the PasswordEncoder bean from SecurityConfig


    public Customer generateBankDetails(Customer customer) {

        String customerId;
        do {
            customerId = "CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (customerRepository.findByCustomerId(customerId).isPresent());
        customer.setCustomerId(customerId);

        // Example Bank Prefix and Branch Code
        String bankCode = "333";              // MEEWOO internal code
        String branchCode = "3355";           // Example Kalyani Branch
        String accountSerial = String.valueOf((long)(Math.random() * 1000000L));  // 6-digit serial

        // Format: bankCode + branchCode + serial (total 12 digits)
        String accountNumber = bankCode + branchCode + String.format("%06d", Long.parseLong(accountSerial));

        // Format: MEWO + 0 + BranchCode
        String ifscCode = "MEWO" + branchCode;


        // Set generated values
        customer.setAccountNumber(accountNumber);
        customer.setIfsCode(ifscCode);
        customer.setBranchCode(branchCode);

        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        customer.setApproved(false); // this for account are pending for approval
        customer.setAdmin(false); // this is for this user not admin

        return customer;  // Return the updated customer object
    }



    @Transactional
    public Customer register(Customer customer) {
        // Check for duplicates
        if (customerRepository.findByMobileNumber(customer.getMobileNumber()).isPresent()) {
            throw new RuntimeException("Mobile number already registered.");
        }
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered.");
        }

        // Store raw password temporarily
        String rawPassword = customer.getPassword();
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new RuntimeException("Password cannot be empty.");
        }

        // Generate IDs, Bank Details, Set initial status flags
        customer = generateBankDetails(customer);

        // HASH the raw password and set it on the customer object
        customer.setPassword(passwordEncoder.encode(rawPassword));

        // Set initial balance
        customer.setBalance(500.0);

        // Save the complete customer object
        Customer savedCustomer = customerRepository.save(customer);
        return savedCustomer;
    }


    @Transactional // Ensures the whole operation is atomic
    public Employee createEmployeeFromApplication(JobApplication application, String initialPassword) {
        // Keep the log message style
        log.info("Attempting to create EMPLOYEE record from application ID: {}", application.getId());

        // 1. Pre-checks for existing conflicts in BOTH tables
        // Check Customer Table
        if (customerRepository.findByEmail(application.getApplicantEmail()).isPresent()) {
            log.error("Employee creation failed: Email {} already exists in CUSTOMER table.", application.getApplicantEmail());
            throw new RuntimeException("Email already exists as a customer."); // Keep existing exception type
        }
        if (customerRepository.findByMobileNumber(application.getApplicantPhone()).isPresent()) {
            log.error("Employee creation failed: Mobile number {} already exists in CUSTOMER table.", application.getApplicantPhone());
            throw new RuntimeException("Mobile number already exists as a customer."); // Keep existing exception type
        }
        // Check Employee Table
        if (employeeRepository.findByEmail(application.getApplicantEmail()).isPresent()) {
            log.error("Employee creation failed: Email {} already exists in EMPLOYEE table.", application.getApplicantEmail());
            throw new RuntimeException("Email already exists as an employee."); // Keep existing exception type
        }
        if (employeeRepository.findByMobileNumber(application.getApplicantPhone()).isPresent()) {
            log.error("Employee creation failed: Mobile number {} already exists in EMPLOYEE table.", application.getApplicantPhone());
            throw new RuntimeException("Mobile number already exists as an employee."); // Keep existing exception type
        }

        // Check the *provided* initial password (Keep existing logic)
        if (initialPassword == null || initialPassword.isBlank()) {
            log.error("Employee creation failed: Initial password cannot be empty for applicant {}", application.getApplicantEmail());
            throw new IllegalArgumentException("Initial password cannot be empty for new employee.");
        }

        // 2. Create and populate the NEW Employee object (NOT Customer)
        Employee employee = new Employee();
        employee.setFname(application.getApplicantFirstName());
        employee.setLname(application.getApplicantLastName());
        employee.setEmail(application.getApplicantEmail());
        employee.setMobileNumber(application.getApplicantPhone());
        // Map relevant fields from JobApplication to Employee
        employee.setJobTitle(application.getDesiredRole()); // Example mapping
        employee.setHireDate(LocalDate.now()); // Set hire date

        // *** --- START: Employee ID Generation --- ***
        // 3. Generate a unique Employee ID (Login ID) - Keep existing logic
        String employeeId; // Changed variable name for clarity
        do {
            employeeId = "EMP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            // *** Check uniqueness in the EMPLOYEE table ***
        } while (employeeRepository.findByEmployeeId(employeeId).isPresent());
        employee.setEmployeeId(employeeId); // Set the generated ID on the Employee object
        log.debug("Generated unique Employee ID: {}", employeeId);
        // *** --- END: Employee ID Generation --- ***

        // 4. Remove setting of bank details not present in Employee entity
        // employee.setAccountNumber(...) // REMOVE
        // employee.setIfsCode(...)       // REMOVE
        // employee.setBranchCode(...)    // REMOVE
        // employee.setBalance(...)       // REMOVE

        // 5. Remove setting of Customer-specific flags
        // employee.setAdmin(false);      // REMOVE (No isAdmin in Employee entity)
        // employee.setEmployee(true);    // REMOVE (Implicitly true by being in Employee table)
        // employee.setApproved(true);    // REMOVE (Handled by accountEnabled in Employee entity)

        // 6. Hash and set the *provided* initial password securely on the Employee object
        employee.setPassword(passwordEncoder.encode(initialPassword));
        log.debug("Provided initial password hashed for employee {}", employeeId);

        // 7. Save the new EMPLOYEE record using EmployeeRepository
        Employee savedEmployee = employeeRepository.save(employee); // Use employeeRepository
        log.info("Successfully created EMPLOYEE record {} with Employee ID: {}", savedEmployee.getEmail(), savedEmployee.getEmployeeId());

        // 8. Return the newly created EMPLOYEE object
        return savedEmployee;
    }


}
