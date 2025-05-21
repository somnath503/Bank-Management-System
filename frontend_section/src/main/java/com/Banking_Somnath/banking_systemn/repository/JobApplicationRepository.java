package com.Banking_Somnath.banking_systemn.repository;

import com.Banking_Somnath.banking_systemn.model.ApplicationStatus;
import com.Banking_Somnath.banking_systemn.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository  extends JpaRepository<JobApplication , Long> {
    List<JobApplication> findByStatusOrderByApplicationDateDesc(ApplicationStatus status);
    List<JobApplication> findAllByOrderByApplicationDateDesc();
}
