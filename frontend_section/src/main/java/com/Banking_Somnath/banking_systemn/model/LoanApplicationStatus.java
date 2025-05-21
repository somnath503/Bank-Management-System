package com.Banking_Somnath.banking_systemn.model;

// Statuses for the loan application lifecycle
public enum LoanApplicationStatus {
    PENDING,        // Submitted, needs admin action
    UNDER_REVIEW,   // Optional: Admin is actively reviewing
    APPROVED,       // Approved, pending disbursement (disbursement is a separate future step)
    REJECTED,       // Application denied
    DISBURSED,      // Funds given to customer (Future State)
    CLOSED          // Loan fully repaid (Future State)
}