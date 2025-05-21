import React, { useState } from 'react';
import axios from 'axios';
import {
    Container, Paper, Typography, Box, TextField, Button, CircularProgress, Alert, Grid, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = 'http://localhost:8080'; // Your backend URL

// Example Loan Types & Terms (Ideally fetch from backend/config)
const loanTypes = ["PERSONAL", "HOME", "CAR", "EDUCATION", "BUSINESS"];
const loanTerms = [6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120]; // In months
const employmentStatuses = ["Salaried", "Self-Employed", "Business Owner", "Student", "Retired", "Unemployed", "Other"];

export default function ApplyLoanPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [formData, setFormData] = useState({
        loanType: '',
        requestedAmount: '',
        termInMonths: '',
        purpose: '',
        monthlyIncome: '',
        employmentStatus: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFeedback({ type: '', message: '' }); // Clear feedback on any input change
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: '', message: '' });

        // --- Frontend Validation ---
        let validationError = '';
        if (!formData.loanType) validationError = 'Loan Type is required.';
        else if (!formData.requestedAmount) validationError = 'Requested Amount is required.';
        else if (!formData.termInMonths) validationError = 'Repayment Term is required.';
        else if (!formData.purpose) validationError = 'Purpose of Loan is required.';

        const requestedAmt = parseFloat(formData.requestedAmount);
        if (!validationError && (isNaN(requestedAmt) || requestedAmt <= 0)) {
            validationError = 'Requested amount must be a positive number.';
        } else if (!validationError && requestedAmt < 1000) { // Example minimum
            validationError = 'Minimum loan amount is ₹1,000.';
        }

        const income = formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null;
        if (!validationError && income !== null && (isNaN(income) || income < 0)) {
            validationError = 'Monthly income, if entered, must be zero or positive.';
        }

        if (validationError) {
            setFeedback({ type: 'error', message: validationError });
            setIsLoading(false);
            return;
        }
        // --- End Validation ---

        try {
            // Prepare data for backend, ensuring numbers are parsed correctly
            const dataToSend = {
                loanType: formData.loanType,
                requestedAmount: requestedAmt,
                termInMonths: parseInt(formData.termInMonths, 10),
                purpose: formData.purpose,
                monthlyIncome: income, // Send parsed number or null
                employmentStatus: formData.employmentStatus,
            };

            // API Call
            const response = await axios.post(
                `${API_BASE_URL}/loan/apply`,
                dataToSend,
                { withCredentials: true } // Send auth cookies
            );

            // Handle Success
            if (response.data?.success) {
                setFeedback({ type: 'success', message: response.data.message || 'Loan application submitted successfully! Awaiting review.' });
                // Clear form
                setFormData({
                    loanType: '', requestedAmount: '', termInMonths: '', purpose: '', monthlyIncome: '', employmentStatus: ''
                });
                // Redirect after a short delay
                setTimeout(() => navigate('/my-loans'), 2500);
            } else {
                // Handle backend indicating failure {success: false, message: '...'}
                throw new Error(response.data?.message || 'Failed to submit loan application. Unknown server response.');
            }
        } catch (err) {
            // Handle API errors (network, server error status codes)
            console.error("Loan Application submission error:", err);
            const errorMsg = err.response?.data?.message // Check for message in error response body
                           || err.message // General axios/network error message
                           || 'An unexpected error occurred during submission.';
            setFeedback({ type: 'error', message: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user is logged in
    if (!authState.isLoggedIn) {
         return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="warning">Please log in to apply for a Loan.</Alert>
                    <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/login')}>Login</Button>
                </Paper>
            </Container>
         );
    }

    // Render the form
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
                {/* Header with Back Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                        Apply for Loan
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/header')}>
                        My Account
                    </Button>
                </Box>

                {/* Feedback Alert */}
                {feedback.message && (
                    <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }} variant="outlined">
                        {feedback.message}
                    </Alert>
                )}

                {/* Loan Application Form */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}> {/* Increased spacing */}
                        {/* Row 1 */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!formData.loanType && feedback.type === 'error'}>
                                <InputLabel id="loan-type-label">Loan Type *</InputLabel>
                                <Select
                                    labelId="loan-type-label"
                                    id="loanType"
                                    name="loanType"
                                    value={formData.loanType}
                                    label="Loan Type *"
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                    <MenuItem value="" disabled><em>Select Loan Type</em></MenuItem>
                                    {loanTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <TextField
                                label="Requested Amount (₹) *"
                                id="requestedAmount"
                                name="requestedAmount"
                                type="number"
                                value={formData.requestedAmount}
                                onChange={handleChange}
                                fullWidth
                                required
                                disabled={isLoading}
                                error={(!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) && feedback.type === 'error'}
                                inputProps={{ min: "1000" }} // Example minimum
                                />
                        </Grid>

                         {/* Row 2 */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!formData.termInMonths && feedback.type === 'error'}>
                                <InputLabel id="term-label">Repayment Term *</InputLabel>
                                <Select
                                    labelId="term-label"
                                    id="termInMonths"
                                    name="termInMonths"
                                    value={formData.termInMonths}
                                    label="Repayment Term *"
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                     <MenuItem value="" disabled><em>Select Term (Months)</em></MenuItem>
                                    {loanTerms.map(term => <MenuItem key={term} value={term}>{term} Months</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="employment-label">Employment Status (Optional)</InputLabel>
                                <Select
                                    labelId="employment-label"
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    label="Employment Status (Optional)"
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                     <MenuItem value=""><em>Select Status (Optional)</em></MenuItem>
                                    {employmentStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Row 3 */}
                         <Grid item xs={12}>
                              <TextField
                                label="Approx. Monthly Income (₹, Optional)"
                                id="monthlyIncome"
                                name="monthlyIncome"
                                type="number"
                                value={formData.monthlyIncome}
                                onChange={handleChange}
                                fullWidth
                                disabled={isLoading}
                                inputProps={{ min: "0" }}
                                error={(formData.monthlyIncome && parseFloat(formData.monthlyIncome) < 0) && feedback.type === 'error'}
                                />
                         </Grid>

                        {/* Row 4 */}
                         <Grid item xs={12}>
                              <TextField
                                label="Purpose of Loan *"
                                id="purpose"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                fullWidth
                                required
                                disabled={isLoading}
                                multiline
                                rows={4} // Make purpose field larger
                                placeholder="Briefly describe why you need the loan (e.g., home renovation, car purchase, medical expenses)..."
                                error={!formData.purpose && feedback.type === 'error'}/>
                         </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{ textAlign: 'center' }}> {/* Center button */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ mt: 2, px: 5 }} // Padding and margin
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Loan Application'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}