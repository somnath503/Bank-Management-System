// --- src/component/Page/Admin/AdminApplicationsListPage.js ---
// Enhanced version with logging and improved rendering logic

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Import MUI components
import {
    Container, Typography, Box, Button, Paper, Grid, Tooltip, Chip, IconButton,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Alert, Link as MuiLink // Import necessary MUI components
} from '@mui/material';
// Import Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Backend API Base URL
const API_BASE_URL = 'http://localhost:8080';

// --- Helper Functions ---

// Formats date-time string for display
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        // Options for formatting: e.g., "Aug 23, 2023, 10:30 AM"
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateTimeString));
    } catch (e) {
        console.error("Date formatting error:", e);
        return 'Invalid Date';
    }
};

// Creates a styled Chip based on application status
const getStatusChip = (status) => {
    let color = 'default';
    let label = 'Unknown';

    if (status) {
        label = status.replace('_', ' '); // Replace underscores for readability
        switch (status) {
            case 'PENDING': color = 'warning'; break;
            case 'UNDER_REVIEW': color = 'info'; break;
            case 'INTERVIEW_SCHEDULED': color = 'primary'; break;
            case 'HIRED': color = 'success'; break;
            case 'REJECTED': color = 'error'; break;
            default: color = 'default'; label = status; // Show original if not matched
        }
    }
    // Return MUI Chip component
    return <Chip label={label} color={color} size="small" variant="outlined" />;
};

// --- Component ---

export default function AdminApplicationsListPage() {
    // --- State Variables ---
    const [applications, setApplications] = useState([]); // Holds the fetched application data
    const [isLoading, setIsLoading] = useState(false); // Tracks loading state for fetch
    const [error, setError] = useState(''); // Stores any fetch error messages
    const navigate = useNavigate(); // Hook for programmatic navigation

    // --- Data Fetching Logic ---
    const fetchApplications = useCallback(async () => {
        setIsLoading(true); // Start loading indicator
        setError(''); // Clear previous errors
        console.log("[Frontend] Fetching applications from /admin/applications..."); // LOG 1

        try {
            // Make API call to backend endpoint
            const response = await axios.get(`${API_BASE_URL}/admin/applications`, {
                withCredentials: true // Necessary for authenticated admin endpoints
            });

            console.log("[Frontend] Raw API Response:", response); // LOG 2
            console.log("[Frontend] Response Data:", response.data); // LOG 3

            // Validate the received data
            if (response && Array.isArray(response.data)) {
                console.log(`[Frontend] Received valid array with ${response.data.length} items. Setting state.`); // LOG 4
                setApplications(response.data); // Update state with the array of applications
            } else {
                console.error("[Frontend] Invalid data received. Expected an array, got:", response.data); // LOG 5
                setError("Received unexpected data format from server."); // Set error message
                setApplications([]); // Reset state to empty array
            }
        } catch (err) {
            // Handle API call errors
            console.error("[Frontend] API call failed:", err); // LOG 6
            if (err.response) { // Log details if available
                console.error("[Frontend] Error response data:", err.response.data);
                console.error("[Frontend] Error response status:", err.response.status);
            }
            // Set user-friendly error message
            setError(err.response?.data?.message || err.response?.data || err.message || 'Failed to fetch job applications.');
            setApplications([]); // Reset state on error
        } finally {
            setIsLoading(false); // Stop loading indicator regardless of outcome
        }
    }, []); // `useCallback` with empty dependency array means this function is created once

    // --- Initial Data Fetch ---
    useEffect(() => {
        fetchApplications(); // Fetch data when the component mounts
    }, [fetchApplications]); // Dependency array ensures fetchApplications isn't recreated unnecessarily

    // --- State Change Logger (for debugging) ---
    useEffect(() => {
        console.log("[Frontend] 'applications' state updated to:", applications); // LOG 7
    }, [applications]); // Runs whenever the `applications` state value changes

    // --- Navigation Handler ---
    const handleViewDetails = (appId) => {
        // Navigate to the detail page for the specific application ID
        navigate(`/admin/applications/${appId}`);
    };

    // --- Render Logic ---
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* Wider container */}

             {/* Styled Header */}
            <Paper elevation={4} sx={{
                p: 2, mb: 3, textAlign: 'center',
                background: 'linear-gradient(45deg, #ff9800 30%, #f57c00 90%)', // Orange gradient
                color: 'white', borderRadius: '8px'
            }}>
                 <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Manage Job Applications
                </Typography>
            </Paper>

             {/* Main Content Area */}
             <Paper elevation={2} sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: '8px' }}>
                 {/* Top Bar: Back Button & Refresh */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                     <Button variant="outlined" color="primary" size="small" startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/admin/dashboard')}>
                        Admin Dashboard
                    </Button>
                    <Tooltip title="Refresh List">
                        <span> {/* Wrapper for tooltip when button is disabled */}
                            <IconButton onClick={fetchApplications} color="primary" disabled={isLoading}>
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                 </Box>

                {/* Loading State Indicator */}
                {isLoading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', my: 5, minHeight: '300px' }}>
                        <CircularProgress size={50} />
                        <Typography variant="h6" color="text.secondary" sx={{mt: 2}}>Loading Applications...</Typography>
                    </Box>
                )}

                {/* Error State Display */}
                {!isLoading && error && (
                    <Box sx={{ my: 3, textAlign: 'center' }}> {/* Centered error */}
                        <Alert severity="error" sx={{ mb: 2, justifyContent: 'center' }}>{error}</Alert>
                        <Button onClick={fetchApplications} variant="contained">Try Again</Button>
                    </Box>
                )}

                {/* Table Display (only when not loading and no error) */}
                {!isLoading && !error && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table stickyHeader aria-label="job applications table">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: 'grey.200' } }}> {/* Styled header */}
                                    <TableCell>Applicant Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Desired Role</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Conditional Rendering: Show message or map data */}
                                { !Array.isArray(applications) || applications.length === 0 ? (
                                    // Display when applications is not an array or is empty
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5, fontStyle: 'italic', color: 'text.secondary' }}>
                                            No submitted job applications found.
                                         </TableCell>
                                    </TableRow>
                                ) : (
                                    // Map and render rows only if applications is a non-empty array
                                    applications.map((app, index) => (
                                        <TableRow
                                            hover
                                            key={app.id} // Use unique ID from application data
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                backgroundColor: index % 2 !== 0 ? 'action.hover' : 'background.paper' // Alternate row bg
                                             }}
                                        >
                                            {/* Display application data - use 'N/A' as fallback */}
                                            <TableCell sx={{fontSize: '0.875rem'}}>{`${app.applicantFirstName || 'N/A'} ${app.applicantLastName || ''}`.trim()}</TableCell>
                                            <TableCell sx={{fontSize: '0.875rem'}}>{app.applicantEmail || 'N/A'}</TableCell>
                                            <TableCell sx={{fontSize: '0.875rem'}}>{app.applicantPhone || 'N/A'}</TableCell>
                                            <TableCell sx={{fontSize: '0.875rem'}}>{app.desiredRole || 'N/A'}</TableCell>
                                            <TableCell sx={{fontSize: '0.875rem'}}>{formatDateTime(app.applicationDate)}</TableCell>
                                            <TableCell align="center">{getStatusChip(app.status)}</TableCell>
                                            <TableCell align="center">
                                                {/* Action button to view details */}
                                                <Tooltip title="View Details & Actions">
                                                    <IconButton color="primary" size="small" onClick={() => handleViewDetails(app.id)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper> {/* End Content Paper */}
        </Container>
    );
}