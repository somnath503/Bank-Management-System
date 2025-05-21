package com.Banking_Somnath.banking_systemn.model;

public enum FixedDepositStatus {
    PENDING,    // Application submitted by customer, awaiting admin approval
    ACTIVE,     // Approved by admin, FD is running, principal debited
    REJECTED,   // Application rejected by admin
    MATURED,    // Term completed, awaiting payout (or auto-payout)
    CLOSED      // Prematurely closed by customer (optional, involves penalty logic)
}