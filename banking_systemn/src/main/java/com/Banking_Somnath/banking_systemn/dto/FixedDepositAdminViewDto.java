package com.Banking_Somnath.banking_systemn.dto;
import com.Banking_Somnath.banking_systemn.model.FixedDepositStatus;
import java.time.LocalDateTime;

public class FixedDepositAdminViewDto {
    private Long id;
    private CustomerBasicInfoDto customerInfo; // Contains customerId, fullName, etc.
    private Double principalAmount;
    private Integer termInMonths;
    private Double interestRate;
    private LocalDateTime applicationDate;
    private FixedDepositStatus status;
    private String sourceAccountNumber;

    // Constructor
    public FixedDepositAdminViewDto(Long id, CustomerBasicInfoDto customerInfo,
                                    Double principalAmount, Integer termInMonths, Double interestRate,
                                    LocalDateTime applicationDate, FixedDepositStatus status, String sourceAccountNumber) {
        this.id = id;
        this.customerInfo = customerInfo;
        this.principalAmount = principalAmount;
        this.termInMonths = termInMonths;
        this.interestRate = interestRate;
        this.applicationDate = applicationDate;
        this.status = status;
        this.sourceAccountNumber = sourceAccountNumber;
    }
    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CustomerBasicInfoDto getCustomerInfo() { return customerInfo; }
    public void setCustomerInfo(CustomerBasicInfoDto customerInfo) { this.customerInfo = customerInfo; }
    public Double getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(Double principalAmount) { this.principalAmount = principalAmount; }
    public Integer getTermInMonths() { return termInMonths; }
    public void setTermInMonths(Integer termInMonths) { this.termInMonths = termInMonths; }
    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }
    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }
    public FixedDepositStatus getStatus() { return status; }
    public void setStatus(FixedDepositStatus status) { this.status = status; }
    public String getSourceAccountNumber() { return sourceAccountNumber; }
    public void setSourceAccountNumber(String sourceAccountNumber) { this.sourceAccountNumber = sourceAccountNumber; }
}