// this page is for apply FD by customer

import React, { useState, useEffect } from 'react';


import axios from 'axios';
import {
    Container, Paper, Typography, Box, TextField, Button, CircularProgress, Alert, Grid, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = 'http://localhost:8080';

// Example FD Terms (In a real app, ideally fetch these from the backend or a config file)
const fdTerms = [
    { months: 6, label: '6 Months', minAmount: 1000, indicativeRate: 5.5 },
    { months: 12, label: '1 Year', minAmount: 1000, indicativeRate: 6.0 },
    { months: 24, label: '2 Years', minAmount: 2000, indicativeRate: 6.25 },
    { months: 36, label: '3 Years', minAmount: 5000, indicativeRate: 6.5 },
    { months: 60, label: '5 Years', minAmount: 10000, indicativeRate: 6.75 },
];

export default function ApplyFdPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [principalAmount, setPrincipalAmount] = useState('');
    const [termInMonths, setTermInMonths] = useState('');
    const [selectedTermDetails, setSelectedTermDetails] = useState(null); // To store minAmount & rate
    const [customerBalance, setCustomerBalance] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingBalance, setIsFetchingBalance] = useState(true);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Fetch customer's current balance on component mount
    useEffect(() => {
        const fetchBalance = async () => {
            if (!authState.isLoggedIn) {
                setIsFetchingBalance(false);
                return;
            }
            setIsFetchingBalance(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/check-balance`, { withCredentials: true });
                if (response.data?.success && response.data.balance !== undefined) {
                    setCustomerBalance(parseFloat(response.data.balance));
                } else {
                    setFeedback({ type: 'warning', message: 'Could not fetch current account balance.' });
                }
            } catch (error) {
                console.error("Error fetching balance:", error);
                setFeedback({ type: 'error', message: 'Error fetching account balance. Please try again later.' });
            } finally {
                setIsFetchingBalance(false);
            }
        };
        fetchBalance();
    }, [authState.isLoggedIn]);

    // Handle term selection change
    const handleTermChange = (event) => {
        const selectedMonths = event.target.value;
        setTermInMonths(selectedMonths);
        const termDetail = fdTerms.find(term => term.months === parseInt(selectedMonths, 10));
        setSelectedTermDetails(termDetail || null);
        setFeedback({ type: '', message: '' }); // Clear previous feedback
    };

    // Handle amount input change
     const handleAmountChange = (event) => {
         setPrincipalAmount(event.target.value);
         setFeedback({ type: '', message: '' }); // Clear feedback
     };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: '', message: '' });

        const amount = parseFloat(principalAmount);

        // --- Frontend Validation ---
        let validationError = '';
        if (!termInMonths) validationError = 'Please select a term for the Fixed Deposit.';
        else if (isNaN(amount) || amount <= 0) validationError = 'Please enter a valid positive amount.';
        else if (selectedTermDetails && amount < selectedTermDetails.minAmount) {
            validationError = `Minimum amount for the selected term (${selectedTermDetails.label}) is ₹${selectedTermDetails.minAmount.toLocaleString()}.`;
        } else if (customerBalance !== null && amount > customerBalance) {
            validationError = `Insufficient account balance (Available: ₹${customerBalance.toLocaleString()}).`;
        }

        if (validationError) {
            setFeedback({ type: 'error', message: validationError });
            setIsLoading(false);
            return;
        }
        // --- End Validation ---

        try {
            // API Call to apply for FD
            const response = await axios.post(
                `${API_BASE_URL}/fd/apply`,
                { principalAmount: amount, termInMonths: parseInt(termInMonths, 10) },
                { withCredentials: true } // Send auth cookies
            );

            // Handle Success
            if (response.data?.success) {
                setFeedback({ type: 'success', message: response.data.message || 'FD application submitted successfully! Awaiting approval.' });
                setPrincipalAmount('');
                setTermInMonths('');
                setSelectedTermDetails(null);
                // Redirect after a short delay
                setTimeout(() => navigate('/my-fds'), 2500);
            } else {
                // Handle backend indicating failure
                throw new Error(response.data?.message || 'Failed to submit FD application.');
            }
        } catch (err) {
            // Handle API errors
            console.error("FD Application error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred during submission.';
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
                    <Alert severity="warning">Please log in to apply for a Fixed Deposit.</Alert>
                    <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/login')}>Login</Button>
                 </Paper>
            </Container>
         );
     }

    // Render the form
    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
                {/* Header with Back Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                        Apply for Fixed Deposit
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/header')}>
                        My Account
                    </Button>
                </Box>

                {/* Balance Information */}
                {isFetchingBalance ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">Fetching account balance...</Typography>
                    </Box>
                ) : customerBalance !== null && (
                    <Alert severity="info" sx={{ mb: 2 }} variant="outlined">
                         Your current savings account balance: <strong>₹{customerBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                     </Alert>
                 )}

                {/* Feedback Alert */}
                {feedback.message && (
                    <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }} variant="outlined">
                        {feedback.message}
                    </Alert>
                )}

                {/* FD Application Form */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Principal Amount (₹) *"
                                id="principalAmount"
                                name="principalAmount"
                                type="number"
                                value={principalAmount}
                                onChange={handleAmountChange}
                                fullWidth
                                required
                                disabled={isLoading || isFetchingBalance}
                                error={ (selectedTermDetails && parseFloat(principalAmount) < selectedTermDetails.minAmount && principalAmount !== '') || (customerBalance !== null && parseFloat(principalAmount) > customerBalance) }
                                helperText={
                                    (customerBalance !== null && parseFloat(principalAmount) > customerBalance) ? `Amount exceeds available balance.` :
                                    (selectedTermDetails && parseFloat(principalAmount) < selectedTermDetails.minAmount && principalAmount !== '') ? `Min. amount for this term: ₹${selectedTermDetails.minAmount.toLocaleString()}` :
                                    "Enter the amount you wish to deposit."
                                }
                                InputProps={{ inputProps: { min: 0 } }}
                                autoFocus
                            />
                        </Grid>
                         <Grid item xs={12}>
                            <FormControl fullWidth required error={!termInMonths && feedback.type === 'error'}>
                                 <InputLabel id="term-select-label">Select Term *</InputLabel>
                                 <Select
                                    labelId="term-select-label"
                                    id="termInMonths"
                                    name="termInMonths"
                                    value={termInMonths}
                                    label="Select Term *"
                                    onChange={handleTermChange}
                                    disabled={isLoading || isFetchingBalance}
                                >
                                     <MenuItem value="" disabled><em>Select a duration</em></MenuItem>
                                     {fdTerms.map((term) => (
                                        <MenuItem key={term.months} value={term.months}>
                                             {term.label} (Min: ₹{term.minAmount.toLocaleString()}, Rate: {term.indicativeRate}%)
                                         </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Indicative Interest and Maturity (Optional Display) */}
                        {selectedTermDetails && principalAmount && parseFloat(principalAmount) >= selectedTermDetails.minAmount && (
                             <Grid item xs={12}>
                                 <Typography variant="body2" color="text.secondary">
                                     Indicative Interest Rate: {selectedTermDetails.indicativeRate}% p.a. <br />
                                     {/* Note: Actual maturity amount is calculated by backend on approval */}
                                 </Typography>
                             </Grid>
                         )}

                         <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ mt: 2, px: 5 }}
                                disabled={isLoading || isFetchingBalance}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit FD Application'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}