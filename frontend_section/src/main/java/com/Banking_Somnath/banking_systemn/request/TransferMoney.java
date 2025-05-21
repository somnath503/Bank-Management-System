package com.Banking_Somnath.banking_systemn.request;


public class TransferMoney {
    private double amount;
//    private String senderPassword; // Name it clearly to avoid confusion
    private String receiverCustomerId;
    private String receiverMobileNo;

    // Getters and Setters (Generate these using your IDE or manually)

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

//    public String getSenderPassword() {
//        return senderPassword;
//    }

//    public void setSenderPassword(String senderPassword) {
//        this.senderPassword = senderPassword;
//    }

    public String getReceiverCustomerId() {
        return receiverCustomerId;
    }

    public void setReceiverCustomerId(String receiverCustomerId) {
        this.receiverCustomerId = receiverCustomerId;
    }

    public String getReceiverMobileNo() {
        return receiverMobileNo;
    }

    public void setReceiverMobileNo(String receiverMobileNo) {
        this.receiverMobileNo = receiverMobileNo;
    }
}

