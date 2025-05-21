package com.Banking_Somnath.banking_systemn.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
public class Customer implements UserDetails {
    @Id
    private String  mobileNumber;

    @Column(nullable = false , unique = true) // this means customer can not enter one mail many times this must be unique every time when open new account one email fo rone account
    private String email;

    private String fname;
    private String lname;
    private String fathername;
    private String address;
    private String pincode;
    private LocalDate dob;
    private String password;
    private String accountNumber;
    private String ifsCode;
    private String branchCode;
    private double balance;
    @Column(nullable = false,unique = true)
    private String customerId;

    // this new two field for admin roel
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isAdmin = false;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isApproved = false;

//    @Column(nullable = false , columnDefinition = "BOOLEAN DEFAULT false")
//    private boolean isEmployee = false;

    public Customer(){

    }

    public Customer(String fathername,
                    String customerId,
                    LocalDate dob, String pincode,
                    boolean isAdmin, boolean isApproved,
                    boolean isEmployee,

                    String address, String lname, String fname, String email, String mobileNumber , String password , String accountNumber , String ifsCode, String branchCode , double balance) {
        this.fathername = fathername;
        this.dob = dob;
        this.pincode = pincode;
        this.address = address;
        this.lname = lname;
        this.fname = fname;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.password=password;
        this.accountNumber=accountNumber;
        this.ifsCode=ifsCode;
        this.branchCode=branchCode;
        this.balance=balance;
        this.customerId=customerId;
        this.isAdmin=isAdmin;
        this.isApproved=isApproved;
//        this.isEmployee = isEmployee;
    }

    public Customer(Customer customer) {

    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (this.isAdmin) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else if (this.isApproved) { // Must NOT be employee AND approved/active
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        // If not approved, they have no role effectively preventing login via isEnabled()
        return authorities;
    }


    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public String getFathername() {
        return fathername;
    }

    public void setFathername(String fathername) {
        this.fathername = fathername;
    }

    public String getLname() {
        return lname;
    }

    public void setLname(String lname) {
        this.lname = lname;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return this.customerId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.isApproved || this.isAdmin;
    }


    public void setPassword(String password) {
        this.password = password;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfsCode() {
        return ifsCode;
    }

    public void setIfsCode(String ifsCode) {
        this.ifsCode = ifsCode;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }
}
