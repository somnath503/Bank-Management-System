package com.Banking_Somnath.banking_systemn.model;

// --- File: main/java/com/Banking_Somnath/banking_systemn/model/Employee.java --

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "employee") // Map to the 'employee' database table
public class Employee implements UserDetails {

    @Id
    @Column(nullable = false, unique = true, length = 50) // Primary Key
    private String employeeId; // This will be the username (e.g., EMP-XXXXXX)

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // Hashed password

    @Column(length = 50)
    private String fname;

    @Column(length = 50)
    private String lname;

    @Column(length = 20, unique = true)
    private String mobileNumber;

    @Column(length = 100)
    private String jobTitle;

    private LocalDate hireDate;

    // Flags relevant for UserDetails interface
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private boolean accountEnabled = true; // Employees are active once created

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean accountLocked = false;

    // --- Default Constructor (Required by JPA) ---
    public Employee() {
    }

    // --- Getters and Setters ---
    // (Generate for all fields: employeeId, email, password, fname, lname, mobileNumber,
    // jobTitle, hireDate, accountEnabled, accountLocked)

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; } // Getter needed by UserDetails
    public void setPassword(String password) { this.password = password; }
    public String getFname() { return fname; }
    public void setFname(String fname) { this.fname = fname; }
    public String getLname() { return lname; }
    public void setLname(String lname) { this.lname = lname; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    public boolean isAccountEnabled() { return accountEnabled; }
    public void setAccountEnabled(boolean accountEnabled) { this.accountEnabled = accountEnabled; }
    public boolean isAccountLocked() { return accountLocked; }
    public void setAccountLocked(boolean accountLocked) { this.accountLocked = accountLocked; }


    // --- UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // All users in this table are employees
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
    }

    @Override
    public String getUsername() {
        // Spring Security uses this as the unique identifier for login
        return this.employeeId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Or implement logic if accounts expire
    }

    @Override
    public boolean isAccountNonLocked() {
        return !this.accountLocked; // Use the flag
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Or implement logic if passwords expire
    }

    @Override
    public boolean isEnabled() {
        return this.accountEnabled; // Use the flag
    }
}
