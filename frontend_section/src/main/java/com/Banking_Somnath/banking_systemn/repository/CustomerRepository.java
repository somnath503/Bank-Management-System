package com.Banking_Somnath.banking_systemn.repository;

import com.Banking_Somnath.banking_systemn.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByMobileNumber(String mobileNumber);
    Optional<Customer> findByCustomerId(String customerId);
    List<Customer> findByIsApproved(boolean isApproved); // Find by customer by their approval status
    Optional<Customer> findByCustomerIdAndMobileNumber(String customerId, String mobileNumber);

}
