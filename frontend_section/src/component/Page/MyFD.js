import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Alert, Box, Chip, Button, Collapse, IconButton, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';

// <<< UPDATE NEEDED HERE (OPTIONAL BUT RECOMMENDED) >>>
// Remove the local helper functions below and import them instead.
// import { formatDate, formatDateTime, formatCurrency, getFdStatusChip } from '../../../utils/formatters'; // Adjust path as needed

const API_BASE_URL = 'http://localhost:8080';

// --- Helper Functions (These should ideally be imported from src/utils/formatters.js) ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
};
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        return new Date(dateTimeString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) { return 'Invalid Date'; }
};
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const getFdStatusChip = (status) => {
    let color = 'default';
    let label = status ? status : 'Unknown';
    switch (status) {
        case 'PENDING': color = 'warning'; break;
        case 'ACTIVE': color = 'success'; break;
        case 'REJECTED': color = 'error'; break;
        case 'MATURED': color = 'info'; break;
        case 'CLOSED': color = 'default'; break; // For premature closure
        default: color = 'default';
    }
    return <Chip label={label} color={color} size="small" variant="outlined" />;
};
// --- End Helper Functions ---


// --- FdRow Sub-component ---
function FdRow({ fd }) {
    const [open, setOpen] = useState(false); // State for collapse

    return (
        <React.Fragment>
            {/* Main visible row */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{ width: '5%' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ width: '10%' }}>{fd.id}</TableCell>
                <TableCell sx={{ width: '20%' }}>{formatDateTime(fd.applicationDate)}</TableCell>
                <TableCell sx={{ width: '20%' }} align="right">{formatCurrency(fd.principalAmount)}</TableCell>
                <TableCell sx={{ width: '15%' }}>{fd.termInMonths} Months</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">{fd.interestRate?.toFixed(2)}%</TableCell>
                <TableCell sx={{ width: '15%' }} align="center">{getFdStatusChip(fd.status)}</TableCell>
            </TableRow>
            {/* Collapsible details row */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Details for FD ID: {fd.id}
                            </Typography>
                            <Grid container spacing={1} sx={{ fontSize: '0.9rem' }}>
                                <Grid item xs={12} sm={6}><strong>Source Account:</strong> {fd.sourceAccountNumber || 'N/A'}</Grid>
                                <Grid item xs={12} sm={6}><strong>Start Date:</strong> {fd.status === 'ACTIVE' || fd.status === 'MATURED' ? formatDate(fd.startDate) : 'Pending Approval'}</Grid>
                                <Grid item xs={12} sm={6}><strong>Maturity Date:</strong> {formatDate(fd.maturityDate)}</Grid>
                                <Grid item xs={12} sm={6}><strong>Maturity Amount:</strong> {formatCurrency(fd.maturityAmount)}</Grid>
                                {/* This line will now work correctly if approvalDate is in the fd object from backend */}
                                {fd.status === 'ACTIVE' && fd.approvalDate && (
                                    <Grid item xs={12} sm={6}><strong>Approved On:</strong> {formatDateTime(fd.approvalDate)}</Grid>
                                )}
                                {fd.status === 'REJECTED' && (
                                    <Grid item xs={12}>
                                        <Typography color="error" component="span"><strong>Rejection Reason:</strong> {fd.rejectionReason || 'Not specified'}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
// --- End FdRow Sub-component ---


// --- MyFdsPage Main Component ---
export default function MyFdsPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [fds, setFds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch user's FDs
    const fetchMyFds = useCallback(async () => {
        if (!authState.isLoggedIn) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/fd/my-fds`, { withCredentials: true });
            if (response.data?.success && Array.isArray(response.data.fixedDeposits)) {
                setFds(response.data.fixedDeposits);
            } else {
                 throw new Error(response.data?.message || "Could not fetch your fixed deposits.");
            }
        } catch (err) {
            console.error("Error fetching My FDs:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load your fixed deposits.');
            setFds([]);
        } finally {
            setIsLoading(false);
        }
    }, [authState.isLoggedIn]);

    // Fetch FDs on component mount
    useEffect(() => {
        fetchMyFds();
    }, [fetchMyFds]);

    // Render login prompt if not logged in
     if (!authState.isLoggedIn) {
         return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="warning">Please log in to view your Fixed Deposits.</Alert>
                     <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/login')}>Login</Button>
                 </Paper>
            </Container>
          );
     }

    // Main render
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                 {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                     <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>My Fixed Deposits</Typography>
                      <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/header')}>My Account</Button>
                 </Box>

                {/* Loading Indicator */}
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}

                {/* Error Alert */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* FD Table */}
                {!isLoading && !error && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table aria-label="collapsible fixed deposits table">
                            <TableHead sx={{ backgroundColor: 'primary.lighter', '& th': { fontWeight: 'bold', color: 'primary.contrastText' } }}>
                                <TableRow>
                                    <TableCell /> {/* For collapse button */}
                                    <TableCell>FD ID</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell align="right">Principal (₹)</TableCell>
                                    <TableCell>Term</TableCell>
                                    <TableCell align="right">Interest Rate</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, fontStyle: 'italic', color: 'text.secondary' }}>
                                            You haven't opened any Fixed Deposits yet.
                                             <Button size="small" sx={{ml: 2}} variant='text' startIcon={<AddIcon />} onClick={() => navigate('/apply-fd')}>Apply for an FD</Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fds.map((fd) => <FdRow key={fd.id} fd={fd} />)
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Button to Apply for Another FD (shown if FDs exist or always) */}
                 {!isLoading && ( // Show this button whether FDs exist or not, as long as not loading
                     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                         <Button variant="contained" color="info" startIcon={<AddIcon />} onClick={() => navigate('/apply-fd')}>
                             Apply for a New FD
                         </Button>
                     </Box>
                 )}
            </Paper>
        </Container>
    );
}