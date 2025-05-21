package com.Banking_Somnath.banking_systemn.security;

import com.Banking_Somnath.banking_systemn.model.Customer; // Keep Customer
import com.Banking_Somnath.banking_systemn.model.Employee; // *** ADD Import for Employee ***
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository; // Keep CustomerRepository
import com.Banking_Somnath.banking_systemn.repository.EmployeeRepository; // *** ADD Import for EmployeeRepository ***

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails; // Spring Security interface
import org.springframework.security.core.userdetails.UserDetailsService; // Spring Security interface
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Standard exception
import org.springframework.stereotype.Service; // Mark this as a Spring service bean

import java.util.Optional; // Keep Optional

@Service // This annotation makes the class a Spring-managed bean
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired // Inject the Customer repository
    private CustomerRepository customerRepository;

    // *** ADD Autowire for EmployeeRepository ***
    @Autowired
    private EmployeeRepository employeeRepository;

    @Override // Marks this method as implementing the one from UserDetailsService interface
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        System.out.println("Attempting to load user by username/ID: " + username); // Original log

        if (username == null || username.isBlank()) {
            System.out.println("Error: Username cannot be empty."); // Log similar to original
            throw new UsernameNotFoundException("Username cannot be empty.");
        }

        // --- START: Updated Logic to Check Both Repositories ---
        if (username.startsWith("EMP-")) {
            // Try loading as an Employee
            System.out.println("Username starts with EMP-, attempting to load as Employee.");
            // Find by employeeId and cast Optional<Employee> to Optional<UserDetails> before returning or throwing
            return employeeRepository.findByEmployeeId(username)
                    .map(employee -> {
                        System.out.println("Employee found: " + employee.getUsername() + ", Enabled: " + employee.isEnabled()); // Log similar to original
                        return (UserDetails) employee; // Return Employee as UserDetails
                    })
                    .orElseThrow(() -> {
                        System.out.println("Employee not found with ID: " + username); // Log similar to original
                        return new UsernameNotFoundException("Employee not found with ID: " + username);
                    });

        } else if (username.startsWith("CUST-") || username.startsWith("ADMIN-")) {
            // Try loading as a Customer (or Admin stored in Customer table)
            System.out.println("Username starts with CUST- or ADMIN-, attempting to load as Customer.");
            // Find by customerId and cast Optional<Customer> to Optional<UserDetails>
            return customerRepository.findByCustomerId(username)
                    .map(customer -> {
                        System.out.println("Customer/Admin found: " + customer.getUsername() + ", Enabled: " + customer.isEnabled()); // Log similar to original
                        return (UserDetails) customer; // Return Customer as UserDetails
                    })
                    .orElseThrow(() -> {
                        System.out.println("Customer/Admin not found with ID: " + username); // Log similar to original
                        return new UsernameNotFoundException("Customer/Admin not found with ID: " + username);
                    });
        } else {
            // If prefix doesn't match expected formats
            System.out.println("Username '" + username + "' does not match expected prefixes (CUST-/EMP-/ADMIN-)"); // Log similar to original
            throw new UsernameNotFoundException("User not found or invalid ID format: " + username);
        }
        // --- END: Updated Logic ---
    }
}