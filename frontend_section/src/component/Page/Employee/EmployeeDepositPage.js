// --- src/component/Page/Employee/EmployeeDepositPage.js ---
import React, { useState } from 'react';
import axios from 'axios';
import {
    Container, Paper, Typography, Box, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = 'http://localhost:8080';

export default function EmployeeDepositPage() {
    const navigate = useNavigate();
    const [targetCustomerId, setTargetCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ type: '', message: '' });

        if (!targetCustomerId || !amount || parseFloat(amount) <= 0) {
            setFeedback({ type: 'error', message: 'Please enter a valid Customer ID and a positive amount.' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/employee/deposit`,
                { targetCustomerId, amount: parseFloat(amount) },
                { withCredentials: true } // Send authentication cookies/headers
            );

            if (response.data?.success) {
                setFeedback({ type: 'success', message: response.data.message || 'Deposit successful!' });
                setTargetCustomerId(''); // Clear form on success
                setAmount('');
            } else {
                throw new Error(response.data?.message || 'Deposit failed.');
            }
        } catch (err) {
            console.error("Deposit error:", err);
            setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'An error occurred during deposit.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h1" gutterBottom>
                         Deposit Funds for Customer
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


                {feedback.message && (
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="amount"
                        label="Amount to Deposit (₹)"
                        name="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLoading}
                        inputProps={{ step: "0.01", min: "0.01" }} // Allow decimals, enforce positive
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Perform Deposit'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}