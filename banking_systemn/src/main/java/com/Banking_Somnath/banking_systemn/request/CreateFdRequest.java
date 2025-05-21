package com.Banking_Somnath.banking_systemn.request;

// You can add JSR 303 validation annotations here later if needed
// import jakarta.validation.constraints.*;

public class CreateFdRequest {

    // @NotNull(message = "Principal amount is required.")
    // @DecimalMin(value = "1000.00", inclusive = true, message = "Minimum FD amount must be ₹1,000.00 or more.")
    private Double principalAmount;

    // @NotNull(message = "Term in months is required.")
    // @Min(value = 1, message = "Minimum term for an FD is 1 month.")
    // @Max(value = 120, message = "Maximum term for an FD is 120 months (10 years).") // Example maximum
    private Integer termInMonths;

    // Getters and Setters
    public Double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(Double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public Integer getTermInMonths() {
        return termInMonths;
    }

    public void setTermInMonths(Integer termInMonths) {
        this.termInMonths = termInMonths;
    }
}