import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Alert, Box, Chip, Button, Collapse, IconButton, Tooltip, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add'; // For Apply button

const API_BASE_URL = 'http://localhost:8080';

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) { return 'Invalid Date'; }
};
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const getLoanStatusChip = (status) => {
    let color = 'default';
    let label = status ? status.replace('_', ' ') : 'Unknown';
    switch (status) {
        case 'PENDING': color = 'warning'; break;
        case 'UNDER_REVIEW': color = 'info'; break;
        case 'APPROVED': color = 'success'; break;
        case 'REJECTED': color = 'error'; break;
        case 'DISBURSED': color = 'primary'; break; // Future state
        case 'CLOSED': color = 'default'; break;      // Future state
        default: color = 'default';
    }
    return <Chip label={label} color={color} size="small" variant="outlined" />;
};
// --- End Helper Functions ---


// --- LoanRow Sub-component ---
function LoanRow({ loan }) {
    const [open, setOpen] = useState(false); // State for collapse

    return (
        <React.Fragment>
            {/* Main visible row */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                {/* Collapse button cell */}
                <TableCell sx={{ width: '5%' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* Data cells */}
                <TableCell component="th" scope="row" sx={{ width: '10%' }}>{loan.id}</TableCell>
                <TableCell sx={{ width: '25%' }}>{formatDate(loan.applicationDate)}</TableCell>
                <TableCell sx={{ width: '20%' }}>{loan.loanType || 'N/A'}</TableCell>
                <TableCell sx={{ width: '20%' }} align="right">{formatCurrency(loan.requestedAmount)}</TableCell>
                <TableCell sx={{ width: '20%' }} align="center">{getLoanStatusChip(loan.status)}</TableCell>
            </TableRow>
            {/* Collapsible details row */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Details for Loan ID: {loan.id}
                            </Typography>
                            <Grid container spacing={1} sx={{ fontSize: '0.9rem' }}> {/* Slightly smaller font for details */}
                                {/* Row 1 of details */}
                                <Grid item xs={12} sm={4}><strong>Term:</strong> {loan.termInMonths} Months</Grid>
                                <Grid item xs={12} sm={4}><strong>Income:</strong> {formatCurrency(loan.monthlyIncome)}</Grid>
                                <Grid item xs={12} sm={4}><strong>Employment:</strong> {loan.employmentStatus || 'N/A'}</Grid>

                                {/* Row 2 - Conditional based on status */}
                                {loan.status === 'APPROVED' && (
                                    <>
                                        <Grid item xs={12} sm={4}><strong>Approved Amt:</strong> {formatCurrency(loan.approvedAmount)}</Grid>
                                        <Grid item xs={12} sm={4}><strong>Interest Rate:</strong> {loan.interestRate?.toFixed(2)}%</Grid>
                                        <Grid item xs={12} sm={4}><strong>Approved On:</strong> {formatDate(loan.approvalDate)}</Grid>
                                    </>
                                )}
                                {loan.status === 'REJECTED' && (
                                    <Grid item xs={12}>
                                        <Typography color="error" component="span"><strong>Rejection Reason:</strong> {loan.rejectionReason || 'Not specified'}</Typography>
                                    </Grid>
                                )}

                                {/* Row 3 - Purpose */}
                                <Grid item xs={12} mt={1}>
                                    <strong>Purpose:</strong>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{loan.purpose || 'N/A'}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
// --- End LoanRow Sub-component ---


// --- MyLoansPage Main Component ---
export default function MyLoansPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch user's loans
    const fetchMyLoans = useCallback(async () => {
        if (!authState.isLoggedIn) return; // Guard clause
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/loan/my-loans`, { withCredentials: true });
             if (response.data?.success && Array.isArray(response.data.loanApplications)) {
                 setLoans(response.data.loanApplications);
             } else {
                 throw new Error(response.data?.message || "Could not fetch your loan applications.");
            }
        } catch (err) {
            console.error("Error fetching My Loans:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load loan applications.');
            setLoans([]); // Clear loans on error
        } finally {
            setIsLoading(false);
        }
    }, [authState.isLoggedIn]); // Depend only on login status

    // Fetch loans on component mount
    useEffect(() => {
        fetchMyLoans();
    }, [fetchMyLoans]);

    // Render login prompt if not logged in
    if (!authState.isLoggedIn) {
        return (
             <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="warning">Please log in to view your Loan Applications.</Alert>
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
                     <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>My Loan Applications</Typography>
                      <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/header')}>My Account</Button>
                 </Box>

                {/* Loading Indicator */}
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}

                {/* Error Alert */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Loan Table */}
                {!isLoading && !error && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table aria-label="collapsible loan applications table">
                            <TableHead sx={{ backgroundColor: 'primary.lighter', '& th': { fontWeight: 'bold', color: 'primary.contrastText' } }}>
                                <TableRow>
                                    <TableCell /> {/* Collapse icon cell */}
                                    <TableCell>App ID</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell>Loan Type</TableCell>
                                    <TableCell align="right">Requested Amt.</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, fontStyle: 'italic', color: 'text.secondary' }}>
                                            You haven't applied for any loans yet.
                                             <Button size="small" sx={{ml: 2}} variant='text' startIcon={<AddIcon />} onClick={() => navigate('/apply-loan')}>Apply for a Loan</Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Map through loans and render LoanRow for each
                                    loans.map((loan) => <LoanRow key={loan.id} loan={loan} />)
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Button to Apply for Another Loan (shown only if loans exist) */}
                 {!isLoading && loans.length > 0 && (
                     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                         <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={() => navigate('/apply-loan')}>
                             Apply for Another Loan
                         </Button>
                     </Box>
                 )}
            </Paper>
        </Container>
    );
}