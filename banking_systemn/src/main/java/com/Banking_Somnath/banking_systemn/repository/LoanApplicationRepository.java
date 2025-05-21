package com.Banking_Somnath.banking_systemn.repository;

import com.Banking_Somnath.banking_systemn.model.LoanApplication;
import com.Banking_Somnath.banking_systemn.model.LoanApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    // Find all loan applications for a specific customer, ordered by application date descending
    List<LoanApplication> findByCustomerIdOrderByApplicationDateDesc(String customerId);

    // Find all loan applications with a specific status (or multiple statuses)
    // Order by application date ascending so oldest pending are seen first by admin
    List<LoanApplication> findByStatusInOrderByApplicationDateAsc(List<LoanApplicationStatus> statuses);

    // Specific finder if only pending needed often
    List<LoanApplication> findByStatusOrderByApplicationDateAsc(LoanApplicationStatus status);
}