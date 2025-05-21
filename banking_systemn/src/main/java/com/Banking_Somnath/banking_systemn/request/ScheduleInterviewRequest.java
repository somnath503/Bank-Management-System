package com.Banking_Somnath.banking_systemn.request;

import java.time.LocalDateTime;
public class ScheduleInterviewRequest {


    private LocalDateTime interviewDate;

    // Getters and Setters
    public LocalDateTime getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDateTime interviewDate) {
        this.interviewDate = interviewDate;
    }
}
