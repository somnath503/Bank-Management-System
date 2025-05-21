package com.Banking_Somnath.banking_systemn.request;

// This DTO can be used for rejecting various types of applications (FD, Loan, Job etc.)
// if the only required field is a reason.
// import jakarta.validation.constraints.*;

public class RejectRequestForFd {

    // @NotBlank(message = "Rejection reason cannot be blank.")
    // @Size(min = 5, max = 500, message = "Rejection reason must be between 5 and 500 characters.")
    private String reason;

    // Getters and Setters
    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}