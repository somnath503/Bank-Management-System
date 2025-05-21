package com.Banking_Somnath.banking_systemn.dto; // Or your DTO package

import com.Banking_Somnath.banking_systemn.model.FixedDepositStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FixedDepositCustomerViewDto {
    private Long id;
    private Double principalAmount;
    private Double interestRate;
    private Integer termInMonths;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private Double maturityAmount;
    private FixedDepositStatus status;
    private LocalDateTime applicationDate;
    private String sourceAccountNumber;
    private String rejectionReason; // Only relevant if rejected
    private LocalDateTime approvalDate; // Date of approval/action  // <<< ADDED THIS FIELD

    // Constructors, Getters, and Setters

    public FixedDepositCustomerViewDto() {
    }

    // MODIFIED CONSTRUCTOR TO ACCEPT 12 ARGUMENTS
    public FixedDepositCustomerViewDto(Long id, Double principalAmount, Double interestRate, Integer termInMonths,
                                       LocalDate startDate, LocalDate maturityDate, Double maturityAmount,
                                       FixedDepositStatus status, LocalDateTime applicationDate,
                                       String sourceAccountNumber, // Argument 10
                                       String rejectionReason,     // Argument 11
                                       LocalDateTime approvalDate) { // Argument 12 (for fd.getActionDate())
        this.id = id;
        this.principalAmount = principalAmount;
        this.interestRate = interestRate;
        this.termInMonths = termInMonths;
        this.startDate = startDate;
        this.maturityDate = maturityDate;
        this.maturityAmount = maturityAmount;
        this.status = status;
        this.applicationDate = applicationDate;
        this.sourceAccountNumber = sourceAccountNumber;
        this.rejectionReason = rejectionReason;
        this.approvalDate = approvalDate; // <<< ASSIGNMENT FOR THE NEW FIELD
    }

    // --- Getters ---
    public Long getId() { return id; }
    public Double getPrincipalAmount() { return principalAmount; }
    public Double getInterestRate() { return interestRate; }
    public Integer getTermInMonths() { return termInMonths; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getMaturityDate() { return maturityDate; }
    public Double getMaturityAmount() { return maturityAmount; }
    public FixedDepositStatus getStatus() { return status; }
    public LocalDateTime getApplicationDate() { return applicationDate; }
    public String getSourceAccountNumber() { return sourceAccountNumber; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getApprovalDate() { return approvalDate; } // <<< GETTER FOR THE NEW FIELD

    // --- Setters ---
    public void setId(Long id) { this.id = id; }
    public void setPrincipalAmount(Double principalAmount) { this.principalAmount = principalAmount; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }
    public void setTermInMonths(Integer termInMonths) { this.termInMonths = termInMonths; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setMaturityDate(LocalDate maturityDate) { this.maturityDate = maturityDate; }
    public void setMaturityAmount(Double maturityAmount) { this.maturityAmount = maturityAmount; }
    public void setStatus(FixedDepositStatus status) { this.status = status; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }
    public void setSourceAccountNumber(String sourceAccountNumber) { this.sourceAccountNumber = sourceAccountNumber; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; } // <<< SETTER FOR THE NEW FIELD
}