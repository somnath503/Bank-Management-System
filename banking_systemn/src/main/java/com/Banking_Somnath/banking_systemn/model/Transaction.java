package com.Banking_Somnath.banking_systemn.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,unique = true)
    private String customerId;
    @Column(nullable = true)
    private String mobileNo;
    private double balance;
    private String description;
    private LocalDateTime localDateTime;
    private String senderAccountNumber;  // Account Number for the sender
    private String recipientAccountNumber;  // Account Number for the recipient
    private String branchCode;  // Branch Code relevant to the transaction (could be sender's or receiver's bank/branch)
    private String ifscCode;    // IFSC Code relevant to the transaction
    private String senderMobileNo;
    private String recipientMobileNo;
    private String type;
    public Transaction() {
    }

    public Transaction(Long id, String mobileNo,
                       String customerId,
                       double balance, String description, LocalDateTime localDateTime, String senderAccountNumber, String recipientAccountNumber, String branchCode, String ifscCode, String senderMobileNo, String recipientMobileNo, String type) {
        this.id = id;
        this.mobileNo = mobileNo;
        this.balance = balance;
        this.description = description;
        this.localDateTime = localDateTime;
        this.senderAccountNumber = senderAccountNumber;
        this.recipientAccountNumber = recipientAccountNumber;
        this.branchCode = branchCode;
        this.ifscCode = ifscCode;
        this.senderMobileNo = senderMobileNo;
        this.recipientMobileNo = recipientMobileNo;
        this.type = type;
        this.customerId=customerId;
    }

    public String getCustomerId(){
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(String mobileNo) {
        this.mobileNo = mobileNo;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getLocalDateTime() {
        return localDateTime;
    }

    public void setLocalDateTime(LocalDateTime localDateTime) {
        this.localDateTime = localDateTime;
    }

    public String getSenderAccountNumber() {
        return senderAccountNumber;
    }

    public void setSenderAccountNumber(String senderAccountNumber) {
        this.senderAccountNumber = senderAccountNumber;
    }

    public String getRecipientAccountNumber() {
        return recipientAccountNumber;
    }

    public void setRecipientAccountNumber(String recipientAccountNumber) {
        this.recipientAccountNumber = recipientAccountNumber;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getSenderMobileNo() {
        return senderMobileNo;
    }

    public void setSenderMobileNo(String senderMobileNo) {
        this.senderMobileNo = senderMobileNo;
    }

    public String getRecipientMobileNo() {
        return recipientMobileNo;
    }

    public void setRecipientMobileNo(String recipientMobileNo) {
        this.recipientMobileNo = recipientMobileNo;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
