package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.JobApplication;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    JobApplicationService jobApplicationService;
    @Autowired
    private CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<Customer> findPendingRegistrations() {
        return customerRepository.findByIsApproved(false);
    }

    @Transactional
    public String approveRegistration(String customerId) {
        Optional<Customer> optionalCustomer = customerRepository.findByCustomerId(customerId);

        if (optionalCustomer.isEmpty()) {
            return "Customer not found with ID: " + customerId;
        }

        Customer customer = optionalCustomer.get();

        if (customer.isApproved()) {
            return "Customer with ID: " + customerId + " is already approved.";
        }

        customer.setApproved(true);
        customerRepository.save(customer);

        return "Customer with ID: " + customerId + " successfully approved.";
    }

    @Transactional
    public String rejectRegistration(String customerId) {
        Optional<Customer> optionalCustomer = customerRepository.findByCustomerId(customerId);

        if (optionalCustomer.isEmpty()) {
            return "Customer not found with ID: " + customerId;
        }

        Customer customer = optionalCustomer.get();
        customerRepository.delete(customer);

        return "Customer with ID: " + customerId + " successfully rejected and removed.";
    }

    @Transactional(readOnly = true)
    public List<JobApplication> getAllJobApplications() {
        log.info("Admin fetching all job applications");
        return jobApplicationService.getAllApplications();
    }

    @Transactional(readOnly = true)
    public Optional<JobApplication> getJobApplicationDetails(Long appId) {
        log.info("Admin fetching details for job application ID: {}", appId);
        return jobApplicationService.getApplicationById(appId);
    }

    @Transactional
    public JobApplication scheduleJobInterview(Long appId, LocalDateTime interviewDate, String adminId) {
        log.info("Admin {} scheduling interview for application ID: {} on {}", adminId, appId, interviewDate);
        return jobApplicationService.scheduleInterview(appId, interviewDate, adminId);
    }

    @Transactional
    public JobApplication rejectJobApplication(Long appId, String reason, String adminId) {
        log.info("Admin {} rejecting application ID: {} with reason: {}", adminId, appId, reason);
        return jobApplicationService.rejectApplication(appId, reason, adminId);
    }

    @Transactional
    public JobApplication hireApplicant(Long appId, String adminId) {
        // Note: Initial password handling strategy is within JobApplicationService -> CustomerService
        log.info("Admin {} initiating hire process for application ID: {}", adminId, appId);
        return jobApplicationService.approveHire(appId, adminId);
    }
}
