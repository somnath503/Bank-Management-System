// --- main\java\com\Banking_Somnath\banking_systemn\config\AdminInitializer.java ---
package com.Banking_Somnath.banking_systemn.config; // Ensure package is correct


import com.Banking_Somnath.banking_systemn.model.Customer; // Ensure this import is correct
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository; // Ensure this import is correct
import org.springframework.boot.CommandLineRunner; // Ensure this import is correct
import org.springframework.context.annotation.Bean; // Ensure this import is correct
import org.springframework.context.annotation.Configuration; // Ensure this import is correct
import org.springframework.security.crypto.password.PasswordEncoder; // Ensure this import is correct

@Configuration // Marks this class as a Spring configuration source
public class AdminInitializer {

    // Define a CommandLineRunner bean that will execute after the application context loads
    @Bean
    public CommandLineRunner createAdmin(CustomerRepository customerRepository, PasswordEncoder encoder) {
        return args -> {
            if (customerRepository.findByEmail("admin@example.com").isEmpty()) {
                System.out.println("Creating initial admin user..."); // Log before creation

                // Create a new Customer object for the admin
                Customer admin = new Customer();

                // Set essential details for the admin user
                // Ensure these are unique in your database if running multiple times or with existing data
                admin.setCustomerId("ADMIN-001"); // Unique identifier for login
                admin.setEmail("admin@example.com"); // Unique email
                admin.setMobileNumber("9999999999"); // Unique mobile number

                // Set name and other personal details (can be placeholders for an admin)
                admin.setFname("Admin-Somnath");
                admin.setLname("Admin-Pandit");
                admin.setFathername("System"); // Example placeholder
                admin.setAddress("Head Office"); // Example placeholder
                admin.setPincode("000000"); // Example placeholder
                admin.setDob(java.time.LocalDate.of(2000, 1, 1)); // Example DOB

                // Securely hash the admin's password using the injected PasswordEncoder
                admin.setPassword(encoder.encode("admin123")); // HASH the password

                // Set banking details (placeholders for admin - might not need full details)
                admin.setAccountNumber("000000000001"); // Unique account number
                admin.setIfsCode("ADMINIFSC"); // Example IFSC
                admin.setBranchCode("ADMINBR"); // Example Branch Code
                admin.setBalance(0.0); // Admin might start with zero balance

                // *** FIX ***: Use the correct setter names from your Customer model (setIsApproved, setIsAdmin)
                admin.setApproved(true); // <<< Set this to true so the admin user is 'enabled' for login
                admin.setAdmin(true);   // <<< Set this to true to grant the ROLE_ADMIN authority
                // *** END FIX ***

                // Save the fully configured admin user to the database
                customerRepository.save(admin);
                System.out.println("✅ Admin user 'admin@example.com' (ID: ADMIN-001) inserted successfully.");
            }
            else {
                System.out.println("Admin user 'admin@example.com' already exists. Skipping initialization."); // Log if admin already exists
            }
        };
    }
}