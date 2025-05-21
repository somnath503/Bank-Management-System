
// --- File: main/java/com/Banking_Somnath/banking_systemn/repository/EmployeeRepository.java ---
package com.Banking_Somnath.banking_systemn.repository;

import com.Banking_Somnath.banking_systemn.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> { // Primary Key is String

    // Find by the primary key / username
    Optional<Employee> findByEmployeeId(String employeeId);

    // Find by email (for checks)
    Optional<Employee> findByEmail(String email);

    // Find by mobile (for checks)
    Optional<Employee> findByMobileNumber(String mobileNumber);

}