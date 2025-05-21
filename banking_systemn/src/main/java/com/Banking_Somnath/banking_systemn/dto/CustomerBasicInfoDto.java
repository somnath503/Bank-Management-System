package com.Banking_Somnath.banking_systemn.dto;

public class CustomerBasicInfoDto {
    private String customerId;
    private String fullName;
    private String mobileNumber;
    private String email;

    // Default constructor for Jackson
    public CustomerBasicInfoDto() {
    }

    public CustomerBasicInfoDto(String customerId, String fullName, String mobileNumber, String email) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.email = email;
    }

    // Getters and Setters
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}