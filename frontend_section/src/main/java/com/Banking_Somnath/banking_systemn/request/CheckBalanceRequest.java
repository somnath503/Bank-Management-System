package com.Banking_Somnath.banking_systemn.request;

import jakarta.persistence.Id;

public class CheckBalanceRequest {
    @Id
    private String customerId;
    private String email;
    private double balance;

    public CheckBalanceRequest(String customerId, String email, double balance) {
        this.customerId = customerId;
        this.email = email;
        this.balance = balance;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }
}
