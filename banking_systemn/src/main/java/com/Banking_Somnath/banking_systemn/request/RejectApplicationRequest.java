package com.Banking_Somnath.banking_systemn.request;
// Possibly add @NotBlank
// import jakarta.validation.constraints.NotBlank;

public class RejectApplicationRequest {

    // @NotBlank(message = "Rejection reason cannot be blank")
    private String reason;

    // Getters and Setters
    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
