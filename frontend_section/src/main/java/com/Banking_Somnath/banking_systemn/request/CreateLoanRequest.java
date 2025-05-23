package com.Banking_Somnath.banking_systemn.request;

// Add validation later: @NotBlank, @NotNull, @Min, @Max etc.
// import jakarta.validation.constraints.*;

public class CreateLoanRequest {

    // @NotBlank(message = "Loan type is required")
    private String loanType;

    // @NotNull(message = "Requested amount is required")
    // @DecimalMin(value = "1000.00", message = "Minimum loan amount is ₹1000")
    private Double requestedAmount;

    // @NotNull(message = "Term in months is required")
    // @Min(value = 6, message = "Minimum term is 6 months")
    // @Max(value = 120, message = "Maximum term is 120 months") // Example limits
    private Integer termInMonths;

    // @NotBlank(message = "Purpose of the loan is required")
    // @Size(max = 1000, message = "Purpose description is too long (max 1000 chars)")
    private String purpose;

    // Optional fields
    private Double monthlyIncome;
    private String employmentStatus;

    // Getters and Setters (Generated by IDE)

    public String getLoanType() {
        return loanType;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public Integer getTermInMonths() {
        return termInMonths;
    }

    public void setTermInMonths(Integer termInMonths) {
        this.termInMonths = termInMonths;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
}