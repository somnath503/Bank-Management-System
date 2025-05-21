package com.Banking_Somnath.banking_systemn.response;

import org.springframework.web.bind.annotation.ResponseStatus;

public class BalanceResponse {
    private boolean success;
    private String balance;

    public BalanceResponse(boolean success, String balance) {
        this.success = success;
        this.balance = balance;
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getBalance() {
        return balance;
    }

    public void setBalance(String balance) {
        this.balance = balance;
    }
}
