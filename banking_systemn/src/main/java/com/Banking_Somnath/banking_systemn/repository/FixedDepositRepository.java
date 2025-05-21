package com.Banking_Somnath.banking_systemn.repository;// In main\java\com\Banking_Somnath\banking_systemn\repository\FixedDepositRepository.java
// Add these imports if not already present:
import com.Banking_Somnath.banking_systemn.model.FixedDeposit;
import com.Banking_Somnath.banking_systemn.model.FixedDepositStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
// ... other imports ...

@Repository
public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    // ... your existing methods ...

    // Replace or add this method for fetching pending FDs with their customers
    @Query("SELECT fd FROM FixedDeposit fd JOIN FETCH fd.customer c WHERE fd.status = :status ORDER BY fd.applicationDate ASC")
    List<FixedDeposit> findByStatusWithCustomerOrderByApplicationDateAsc(@Param("status") FixedDepositStatus status);

           // Add this method to fetch FDs by customerId, ensuring customer data is loaded
    @Query("SELECT fd FROM FixedDeposit fd LEFT JOIN FETCH fd.customer c WHERE fd.customerId = :customerId ORDER BY fd.applicationDate DESC")
  List<FixedDeposit> findByCustomerIdWithCustomerOrderByApplicationDateDesc(@Param("customerId") String customerId);
}




