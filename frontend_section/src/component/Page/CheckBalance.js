// --- src/component/Page/CheckBalance.js ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';  // Use auth context

const API_BASE_URL = 'http://localhost:8080';

const CheckBalancePage = () => {
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { authState } = useAuth(); // Access authState (including customerId)

    const handleCheckBalance = async () => {
        if (!authState.isLoggedIn) {
            setMessage("Please log in to check your balance.");
            setBalance(null);
            return;
        }

        // *** FIX: No need to send customerId as param, backend gets it from authentication ***
        console.log("Frontend checking balance for authenticated user:", authState.customerId);
        setIsLoading(true);
        setBalance(null); // Reset balance view
        setMessage('');     // Clear previous messages

        try {
            // Make the GET request, relying on the backend to identify the user via authentication context
            const response = await axios.get(`${API_BASE_URL}/check-balance`, {
                withCredentials: true // Send necessary cookies/auth headers
                // REMOVED: params: { customerId: authState.customerId }
            });
             // *** END FIX ***

            console.log("Check Balance Raw Response:", response);

            // Response structure from backend seems to be { success: true, balance: "123.45" }
            if (response.data && response.data.success === true && response.data.balance !== undefined) {
                const fetchedBalance = parseFloat(response.data.balance);
                if (!isNaN(fetchedBalance)) {
                    setBalance(fetchedBalance);
                    // Don't necessarily need a success message if balance displays
                    // setMessage(`Balance fetched successfully!`);
                } else {
                    console.error("Received non-numeric balance:", response.data.balance);
                    setMessage("Failed to retrieve balance: Invalid format received.");
                    setBalance(null);
                }
            } else {
                // Backend might send error message in balance field or a dedicated message field
                 // Check if balance field contains the error string from backend
                 const errorMsg = response.data?.balance?.startsWith("ERROR:")
                    ? response.data.balance.replace("ERROR:", "").replace("_", " ") // Use balance field if it contains error
                    : response.data?.message || "Failed to retrieve balance. Unexpected response format."; // Otherwise check message field

                console.error("Balance check failed:", errorMsg, response.data);
                setMessage(errorMsg);
                setBalance(null);
            }
        } catch (error) {
            console.error('Error checking balance:', error);
            setBalance(null);
            if (error.response) {
                const errorData = error.response.data;
                // Try to parse error message from backend (might be in `message` or just the body)
                const errorMsg = errorData?.message ||
                                 (typeof errorData === 'string' && errorData.startsWith("ERROR:")) ? errorData.replace("ERROR:", "").replace("_", " ") : // Check if body is error string
                                 (typeof errorData === 'string' ? errorData : // Use body if it's just a string
                                 `Error: ${error.response.status}. Please ensure you are logged in correctly.`);

                setMessage(errorMsg);
                if (error.response.status === 401 || error.response.status === 403) {
                    setMessage("Authentication error. Please log out and log back in.");
                    // Consider calling logout() from context here if needed
                }
            } else if (error.request) {
                setMessage("Network error. Could not reach the server.");
            } else {
                setMessage("An unexpected error occurred while checking balance.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch balance automatically when the component mounts or auth state changes
    useEffect(() => {
        if (authState.isLoggedIn) {
            handleCheckBalance();
        } else {
            setMessage("Please log in to view your balance.");
            setBalance(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authState.isLoggedIn, authState.customerId]); // Re-fetch if customerId changes (though unlikely in same session)

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Check Account Balance
                </Typography>

                <Box sx={{ my: 3, minHeight: '60px', textAlign: 'center', width: '100%' }}>
                    {isLoading && <CircularProgress />}
                    {!isLoading && balance !== null && (
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                            Current Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    )}
                    {!isLoading && message && (
                        // Only show error severity if balance failed to load
                        <Alert severity={balance === null ? "error" : "info"} sx={{ width: '100%', mt: 1 }}>
                            {message}
                        </Alert>
                    )}
                     {!isLoading && balance === null && !message && authState.isLoggedIn && (
                         <Typography variant="body1" color="text.secondary">
                             Click the button below to refresh your balance.
                         </Typography>
                     )}
                    {!authState.isLoggedIn && !isLoading && (
                        <Alert severity="warning" sx={{ width: '100%', mt: 1 }}>
                            Please log in to view your balance.
                        </Alert>
                    )}
                </Box>

                <Button
                    variant="contained"
                    onClick={handleCheckBalance}
                    disabled={isLoading || !authState.isLoggedIn}
                    fullWidth
                    size="large"
                    sx={{ mt: 1 }}
                >
                    {isLoading ? 'Checking...' : 'Refresh Balance'}
                </Button>
            </Paper>
        </Container>
    );
};

export default CheckBalancePage;