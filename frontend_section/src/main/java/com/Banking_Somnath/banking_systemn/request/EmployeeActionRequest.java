package com.Banking_Somnath.banking_systemn.request;

// Base class or just use specific DTOs if fields differ significantly
public class EmployeeActionRequest {
    // Fields needed by specific actions (e.g., target customer identifier, amount)
    // Example:
    private String targetCustomerId; // Can be Customer ID or Account Number
    private double amount;

    // Getters and Setters
    public String getTargetCustomerId() {
        return targetCustomerId;
    }

    public void setTargetCustomerId(String targetCustomerId) {
        this.targetCustomerId = targetCustomerId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}