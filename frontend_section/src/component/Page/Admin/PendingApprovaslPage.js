// --- src/pages/Admin/PendingApprovalsPage.js ---
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // Correct path assumed

// Import MUI components
import {
    Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
    CircularProgress, Alert, Snackbar, Box
} from '@mui/material';

// Base URL for your backend
const API_BASE_URL = 'http://localhost:8080';

export default function PendingApprovalsPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { authState } = useAuth(); // Get auth state

    // Helper function to extract error message string (keep this)
    const getErrorMessage = (err) => {
        let message = 'An unexpected error occurred.'; // Default
        if (err.response) {
            // Log the full error response for detailed debugging
            console.error("API Error Response:", err.response);
            if (err.response.status === 403) {
                message = 'Forbidden: You do not have permission to access this resource. Please ensure you are logged in as an Admin.';
            } else if (err.response.data?.message && typeof err.response.data.message === 'string') {
                message = err.response.data.message;
            } else if (err.response.data && typeof err.response.data === 'string') {
                message = err.response.data;
            } else if (err.response.statusText) {
                 message = `Error: ${err.response.status} ${err.response.statusText}`;
            }
        } else if (err.message) {
            message = err.message; // Network errors, etc.
        }
        return message;
    };

    // Function to fetch pending users
    const fetchPendingUsers = useCallback(async () => {
        // Ensure user is logged in and is an admin before fetching
        if (!authState.isLoggedIn || authState.userRole !== 'ROLE_ADMIN') {
             setError("Access Denied: You must be logged in as an Admin.");
             setIsLoading(false);
             setPendingUsers([]);
             return; // Stop execution if not admin
        }

        setIsLoading(true);
        setError('');
        console.log("Attempting to fetch /admin/pending..."); // Add log

        try {
            const response = await axios.get(`${API_BASE_URL}/admin/pending`, {
                 withCredentials: true // Essential for sending session cookie
            });

            console.log("Response from /admin/pending:", response); // Log success response

            if (Array.isArray(response.data)) {
                setPendingUsers(response.data);
            } else {
                console.warn("Received non-array data for pending users:", response.data);
                setPendingUsers([]);
                setError("Received unexpected data format from server.");
            }

        } catch (err) {
            // *** Log the error object itself for detailed inspection ***
            console.error("Error fetching pending users (Full Error Object):", err);
            setError(getErrorMessage(err)); // Use helper to set user-friendly message
            setPendingUsers([]);
        } finally {
            setIsLoading(false);
        }
        // Depend on authState to re-check permissions if needed
    }, [authState.isLoggedIn, authState.userRole]);


    // Fetch users when component mounts or auth state changes
    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]); // fetchPendingUsers includes authState dependencies

    // --- handleApprove and handleReject remain the same, but will benefit ---
    // --- from the improved getErrorMessage helper                       ---

    // Handler for Approving a user
    const handleApprove = async (customerId) => {
        setError('');
        setSuccessMessage('');
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/approve/${customerId}`, null, {
                 withCredentials: true
            });
            setSuccessMessage(typeof response.data === 'string' ? response.data : `User ${customerId} approved successfully!`);
            fetchPendingUsers(); // Refresh
        } catch (err) {
            console.error(`Error approving user ${customerId}:`, err);
            setError(getErrorMessage(err));
        }
    };

    // Handler for Rejecting a user
    const handleReject = async (customerId) => {
        if (!window.confirm(`Are you sure you want to reject and remove user ${customerId}?`)) {
            return;
        }
        setError('');
        setSuccessMessage('');
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/reject/${customerId}`, null, {
                 withCredentials: true
            });
            setSuccessMessage(typeof response.data === 'string' ? response.data : `User ${customerId} rejected successfully!`);
            fetchPendingUsers(); // Refresh
        } catch (err) {
            console.error(`Error rejecting user ${customerId}:`, err);
            setError(getErrorMessage(err));
        }
    };

    // --- JSX Rendering ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 2, textAlign: 'center', background: 'linear-gradient(45deg, #673ab7 30%, #3f51b5 90%)', color: 'white' }}>
                         <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                         Pending Customer Approvals
                        </Typography>
                </Paper>

            {/* Loading Indicator */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* Success Snackbar */}
             <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
             />

            {/* Table of Pending Users */}
            {/* Render table only when not loading */}
            {!isLoading && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="pending users table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>Customer ID</TableCell>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>Mobile</TableCell>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>Account No</TableCell>
                                    <TableCell sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Show message if loading is finished and there are no users AND no error */}
                                {!error && pendingUsers.length === 0 ? (
                                     <TableRow>
                                         <TableCell colSpan={6} align="center" sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                                            No pending registrations found.
                                         </TableCell>
                                     </TableRow>
                                ) : (
                                     Array.isArray(pendingUsers) && pendingUsers.map((user) => (
                                        <TableRow hover key={user.customerId}>
                                            <TableCell>{user.customerId || 'N/A'}</TableCell>
                                            <TableCell>{`${user.fname || ''} ${user.lname || ''}`.trim() || 'N/A'}</TableCell>
                                            <TableCell>{user.email || 'N/A'}</TableCell>
                                            <TableCell>{user.mobileNumber || 'N/A'}</TableCell>
                                            <TableCell>{user.accountNumber || 'N/A'}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleApprove(user.customerId)}
                                                     sx={{ mr: 1, minWidth: '80px' }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject(user.customerId)}
                                                     sx={{ minWidth: '80px' }}
                                                >
                                                    Reject
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
}