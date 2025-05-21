// --- main\java\com\Banking_Somnath\banking_systemn\config\SecurityConfig.java ---
package com.Banking_Somnath.banking_systemn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Keep for potential future @PreAuthorize use
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(CsrfConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/register", "/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/apply-for-job").permitAll() // Public job application

                        // Admin endpoints (Customer Management & Job Applications)
                        .requestMatchers("/admin/pending", "/admin/approve/**", "/admin/reject/**").hasRole("ADMIN")
                        .requestMatchers("/admin/applications/**").hasRole("ADMIN") // Covers list, detail, schedule, reject, hire
                        .requestMatchers("/admin/**").hasRole("ADMIN") // Catch-all for any other /admin paths
                        .requestMatchers("/admin/fd/**").hasRole("ADMIN")
                        .requestMatchers("/admin/loan/**").hasRole("ADMIN")
                        // Employee endpoints (Customer Financial Actions)
                        // *** MODIFIED: Allow both EMPLOYEE and ADMIN ***
                        .requestMatchers("/employee/**").hasAnyRole("EMPLOYEE", "ADMIN")

                        // Authenticated Customer endpoints
                        .requestMatchers(HttpMethod.GET, "/check-balance").authenticated() // Customer checking own balance
                        .requestMatchers(HttpMethod.POST, "/transfer").authenticated()     // Customer transferring own money
                        .requestMatchers(HttpMethod.GET, "/transactions/download").hasAnyRole("USER", "EMPLOYEE", "ADMIN")// Customer downloading own history
                        .requestMatchers("/fd/apply", "/fd/my-fds").authenticated()
                        .requestMatchers("/loan/apply").authenticated()
                        .requestMatchers("/loan/my-loans").authenticated()
                        .anyRequest().authenticated()
                )
                .httpBasic(withDefaults()); // Use HTTP Basic for simplicity here

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}