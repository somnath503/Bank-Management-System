package com.Banking_Somnath.banking_systemn.repository;

import com.Banking_Somnath.banking_systemn.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCustomerIdAndLocalDateTimeBetweenOrderByLocalDateTimeDesc(
            String customerId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );
}
