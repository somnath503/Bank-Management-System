// --- src/component/Page/TransactionHistoryPage.js ---
import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // Verify this path is correct
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Added for back button

// Ensure your backend API base URL is correct
const API_BASE_URL = 'http://localhost:8080';

// Renamed component to clearly indicate it's for the CUSTOMER
export default function CustomerTransactionHistoryPage() {
    const { authState } = useAuth(); // Get authentication state
    const navigate = useNavigate();

    // State for date inputs and component feedback
    // No targetCustomerId state needed here
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState(''); // Holds error messages for display
    const [loading, setLoading] = useState(false); // Tracks loading state for API call
    const [successMessage, setSuccessMessage] = useState(''); // Holds success messages

    /**
     * Helper function to parse user-friendly error messages from Axios errors.
     * (Same helper function as in the Employee version)
     * @param {Error} err - The error object caught (typically an Axios error).
     * @returns {string} A user-friendly error message string.
     */
    const getErrorMessage = (err) => {
        let message = 'An unexpected error occurred. Please try again.'; // Default message
        if (err.response) {
            console.error("API Error Response:", err.response);
            const status = err.response.status;
            const responseData = err.response.data;

            if (status === 403) {
                // This shouldn't happen if logged in as approved customer, but handle just in case
                message = 'Forbidden: You do not have permission to download history.';
            } else if (status === 401) {
                 message = 'Unauthorized: Please log in again.';
            } else if (status === 400) {
                 message = responseData?.message || 'Bad Request: Please check the dates.';
            } else if (responseData?.message) {
                message = responseData.message;
            } else if (typeof responseData === 'string' && responseData.length > 0 && responseData.length < 200) {
                message = responseData;
            } else if (err.response.statusText) {
                 message = `Error: ${status} ${err.response.statusText}`;
            }
        } else if (err.request) {
            console.error("API No Response Error:", err.request);
            message = 'Network Error: Could not connect to the server.';
        } else {
            console.error('API Request Setup Error:', err.message);
            message = `Error: ${err.message}`;
        }
        return message;
    };

    /**
     * Handles the form submission to download the customer's OWN history PDF.
     */
    const handleDownload = async () => {
        // Clear previous messages
        setError('');
        setSuccessMessage('');

        // --- 1. Frontend Input Validation ---
        let validationError = '';
         if (!startDate) { // No targetCustomerId to check here
            validationError = 'Please select a Start Date.';
        } else if (!endDate) {
            validationError = 'Please select an End Date.';
        } else {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Make end date inclusive
            if (start > end) {
                validationError = 'Start date cannot be after end date.';
            }
        }

        if (validationError) {
            setError(validationError);
            return; // Stop if validation fails
        }

        // --- 2. Start Loading and Prepare API Call ---
        setLoading(true);

        // Construct URL for the CUSTOMER download endpoint
        // *** CRITICAL: NO targetCustomerId parameter is sent ***
        const downloadUrl = `${API_BASE_URL}/transactions/download?startDate=${startDate}&endDate=${endDate}`;
        console.log("Requesting download from (Customer Endpoint):", downloadUrl);

        // --- 3. Make API Request ---
        try {
            const response = await axios.get(downloadUrl, {
                responseType: 'blob', // Expect binary data (the PDF)
                withCredentials: true // Send necessary authentication (cookies/headers)
            });

            // --- 4. Process Successful Response (PDF received) ---
            if (response.status === 200 && response.data?.type === 'application/pdf') {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                const contentDisposition = response.headers['content-disposition'];
                // Use logged-in customer ID for default filename if needed, otherwise use header
                let filename = `transaction_history_${authState.customerId}_${startDate}_to_${endDate}.pdf`; // Default using logged-in ID
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
                    if (filenameMatch && filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                console.log(`Own transaction history download initiated.`);
                setSuccessMessage(`Your download started successfully!`);

            } else {
                // Handle unexpected success response
                console.error("Received unexpected successful response:", response);
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const errorJson = JSON.parse(e.target.result);
                        setError(errorJson.message || "Download failed: Server returned unexpected data.");
                    } catch (parseError) {
                        setError(`Download failed: ${e.target.result || 'Server returned non-PDF data.'}`);
                    }
                }
                reader.onerror = () => setError("Download failed: Could not read response data.");
                reader.readAsText(response.data);
            }

        // --- 5. Handle API Call Errors ---
        } catch (err) {
            console.error(`Error downloading own history:`, err);
            setError(getErrorMessage(err)); // Use helper
        } finally {
            // --- 6. Stop Loading ---
            setLoading(false);
        }
    };

    // --- 7. JSX Rendering ---
    // Check if user is logged in
    if (!authState.isLoggedIn) {
         // Optionally navigate to login or show message
         // navigate('/login'); // Or
         return (
             <Container maxWidth="sm" sx={{ mt: 4 }}>
                 <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Alert severity="warning">Please log in to view or download your transaction history.</Alert>
                    <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/login')}>Login</Button>
                 </Paper>
             </Container>
         );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Download Your History
                    </Typography>
                    {/* Back button might navigate to customer dashboard */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/header')} // Navigate to customer dashboard/header
                    >
                        My Account
                    </Button>
                 </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select a date range to download your transaction history as a PDF.
                </Typography>

                 <Box component="form" onSubmit={(e) => { e.preventDefault(); handleDownload(); }} noValidate>
                    {/* Input Fields - NO targetCustomerId input here */}
                     <TextField
                        label="Start Date"
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setError(''); setSuccessMessage(''); }}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                        margin="normal"
                        disabled={loading}
                        autoFocus // Focus start date first
                    />
                    <TextField
                        label="End Date"
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setError(''); setSuccessMessage(''); }}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                        margin="normal"
                        disabled={loading}
                    />

                    {/* Display Error Message */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>
                            {error}
                        </Alert>
                    )}
                    {/* Display Success Message */}
                    {successMessage && (
                        <Alert severity="success" sx={{ width: '100%', mt: 2, mb: 1 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        // Disable button if loading or dates are empty
                        disabled={loading || !startDate || !endDate}
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    >
                        {loading ? 'Generating...' : 'Download PDF'}
                    </Button>
                 </Box>
            </Paper>
        </Container>
    );
}

// Ensure you replace the existing TransactionHistoryPage component export/usage in App.js
// If you named this file TransactionHistoryPage.js initially, just update its content.
// If you created a new file, update the import and Route path in App.js for the customer section.
// Example update in App.js:
// import CustomerTransactionHistoryPage from './component/Page/CustomerTransactionHistoryPage'; // Or TransactionHistoryPage if renamed
// ...
// <Route path="/history" element={<CustomerTransactionHistoryPage />} /> // Ensure element matches component name