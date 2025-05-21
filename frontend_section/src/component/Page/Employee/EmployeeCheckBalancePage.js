// --- src/component/Page/Employee/EmployeeCheckBalancePage.js ---
import React, { useState } from 'react';
import axios from 'axios';
import {
    Container, Paper, Typography, Box, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = 'http://localhost:8080';

export default function EmployeeCheckBalancePage() {
    const navigate = useNavigate();
    const [targetCustomerId, setTargetCustomerId] = useState('');
    const [balanceInfo, setBalanceInfo] = useState(null); // Store balance info
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: '', message: '' });
        setBalanceInfo(null); // Clear previous balance

        if (!targetCustomerId) {
            setFeedback({ type: 'error', message: 'Please enter a Customer ID or Account No.' });
            setIsLoading(false);
            return;
        }

        try {
            // Note the endpoint structure: /employee/check-balance/{targetCustomerId}
            const response = await axios.get(
                `${API_BASE_URL}/employee/check-balance/${targetCustomerId}`,
                { withCredentials: true }
            );

            if (response.data?.success) {
                 setBalanceInfo({
                    customerId: targetCustomerId, // Keep track of who was checked
                    balance: response.data.balance
                 });
                 setFeedback({ type: 'success', message: 'Balance retrieved successfully.' });
            } else {
                // Handle case where success might be false but data exists
                throw new Error(response.data?.message || 'Failed to retrieve balance.');
            }
        } catch (err) {
            console.error("Check balance error:", err);
             // Backend might return 404 directly or error in body
             if (err.response && err.response.status === 404) {
                 setFeedback({ type: 'error', message: err.response.data?.message || `Customer '${targetCustomerId}' not found.` });
             } else {
                setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'An error occurred checking balance.' });
             }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                         Check Customer Balance
                    </Typography>
                     <Button
                         variant="outlined"
                         size="small"
                         startIcon={<ArrowBackIcon />}
                         onClick={() => navigate('/employee/dashboard')}
                     >
                         Dashboard
                     </Button>
                 </Box>

                 {/* Separate feedback and result display */}
                 {feedback.message && feedback.type !== 'success' && ( // Show only non-success feedback here
                     <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }}>
                         {feedback.message}
                     </Alert>
                 )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="targetCustomerId"
                        label="Target Customer ID or Account No"
                        name="targetCustomerId"
                        value={targetCustomerId}
                        onChange={(e) => setTargetCustomerId(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="success" // Different color
                        sx={{ mt: 2, mb: 2 }} // Adjusted margin
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Check Balance'}
                    </Button>
                </Box>

                {/* Display Balance Result */}
                {balanceInfo && (
                     <Alert severity="success" sx={{ mt: 2 }}>
                        Balance for Customer '{balanceInfo.customerId}':
                         <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
                            ₹{parseFloat(balanceInfo.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                     </Alert>
                )}
            </Paper>
        </Container>
    );
}