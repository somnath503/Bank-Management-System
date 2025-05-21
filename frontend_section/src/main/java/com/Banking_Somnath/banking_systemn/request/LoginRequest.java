package com.Banking_Somnath.banking_systemn.request;

public class LoginRequest {
    private String mobileNumber;
    private String customerId;
    private String password;

    public LoginRequest(){

    }

    public LoginRequest(String mobileNumber, String password, String customerID) {
        this.mobileNumber = mobileNumber;
        this.password = password;
        this.customerId = customerID;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
