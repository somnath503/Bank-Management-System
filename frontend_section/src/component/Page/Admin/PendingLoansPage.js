import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Button, CircularProgress, Alert, Snackbar, Box, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, TextField, Tooltip, IconButton, Grid, Chip, Collapse // Added Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Adjust path
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const API_BASE_URL = 'http://localhost:8080';

// --- Helper Functions (reuse or define here) ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }); }
    catch (e) { return 'Invalid Date'; }
};
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const getLoanStatusChip = (status) => { /* ... (same as MyLoansPage) ... */
    let color = 'default'; let label = status ? status.replace('_', ' ') : 'Unknown';
    switch (status) { /* ... cases ... */ }
    return <Chip label={label} color={color} size="small" variant="outlined" />;
};
// --- End Helper Functions ---


// --- PendingLoanRow Sub-component (Admin View) ---
function PendingLoanRow({ loan, onApproveClick, onRejectClick, actionLoadingId }) {
    const [open, setOpen] = useState(false);
    const isLoading = actionLoadingId === loan.id; // Check if action is loading for *this* row

    return (
        <React.Fragment>
            {/* Main visible row */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{ width: '5%' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: '5%' }}>{loan.id}</TableCell>
                <TableCell sx={{ width: '15%' }}>{loan.customerId}</TableCell>
                <TableCell sx={{ width: '20%' }}>{formatDate(loan.applicationDate)}</TableCell>
                <TableCell sx={{ width: '15%' }}>{loan.loanType}</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">{formatCurrency(loan.requestedAmount)}</TableCell>
                <TableCell sx={{ width: '15%' }} align="center">
                    {/* Action Buttons */}
                    <Tooltip title="Approve Loan">
                         <span> {/* Required for tooltip on disabled button */}
                             <IconButton size="small" onClick={() => onApproveClick(loan)} color="success" disabled={isLoading}>
                                {isLoading ? <CircularProgress size={18} color="inherit"/> : <CheckCircleOutlineIcon fontSize='small' />}
                             </IconButton>
                        </span>
                     </Tooltip>
                     <Tooltip title="Reject Loan">
                          <span>
                              <IconButton size="small" onClick={() => onRejectClick(loan)} color="error" disabled={isLoading}>
                                 <CancelIcon fontSize='small'/>
                              </IconButton>
                          </span>
                     </Tooltip>
                </TableCell>
            </TableRow>
            {/* Collapsible details row */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}> {/* Span all columns */}
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Details for Loan ID: {loan.id} (Customer: {loan.customerId})
                            </Typography>
                            {/* Display details relevant for admin review */}
                            <Grid container spacing={1} sx={{ fontSize: '0.9rem' }}>
                                <Grid item xs={6} sm={3}><strong>Term:</strong> {loan.termInMonths} Months</Grid>
                                <Grid item xs={6} sm={3}><strong>Income:</strong> {formatCurrency(loan.monthlyIncome)}</Grid>
                                <Grid item xs={12} sm={6}><strong>Employment:</strong> {loan.employmentStatus || 'N/A'}</Grid>
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
// --- End PendingLoanRow Sub-component ---


// --- PendingLoansPage Main Component ---
export default function PendingLoansPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [pendingLoans, setPendingLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks which loan action is processing

    // State for dialogs
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [currentLoan, setCurrentLoan] = useState(null); // Holds the loan object for the active dialog
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalDetails, setApprovalDetails] = useState({ approvedAmount: '', interestRate: '' });

    // Fetch pending loans
    const fetchPendingLoans = useCallback(async () => {
        if (!authState.isLoggedIn || authState.userRole !== 'ROLE_ADMIN') {
            setError("Access Denied: Admin privileges required.");
            setIsLoading(false); // Stop loading if not authorized
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Call the backend endpoint for pending loans
            const response = await axios.get(`${API_BASE_URL}/admin/loan/pending`, { withCredentials: true });
            if (Array.isArray(response.data)) {
                setPendingLoans(response.data);
            } else {
                console.warn("Received non-array data for pending loans:", response.data);
                throw new Error("Received unexpected data format from server.");
            }
        } catch (err) {
            console.error("Error fetching pending Loans:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load pending loan applications.');
            setPendingLoans([]);
        } finally {
            setIsLoading(false);
        }
    }, [authState.isLoggedIn, authState.userRole]); // Re-fetch if auth state changes

    // Fetch on mount
    useEffect(() => {
        fetchPendingLoans();
    }, [fetchPendingLoans]);

    // Snackbar handlers
    const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };
    const showSnackbar = (message, severity = 'success') => { setSnackbar({ open: true, message, severity }); };

     // --- Dialog Open/Close ---
     const openApproveDialog = (loan) => {
         setCurrentLoan(loan);
         // Pre-fill amount, clear rate
         setApprovalDetails({ approvedAmount: loan.requestedAmount?.toString() || '', interestRate: '' });
         setApproveDialogOpen(true);
     };
     const closeApproveDialog = () => { setApproveDialogOpen(false); setCurrentLoan(null); setApprovalDetails({ approvedAmount: '', interestRate: '' }); };

     const openRejectDialog = (loan) => { setCurrentLoan(loan); setRejectionReason(''); setRejectDialogOpen(true); };
     const closeRejectDialog = () => { setRejectDialogOpen(false); setCurrentLoan(null); };

    // --- Action Handlers ---
    const handleApprove = async () => {
        // Validation inside dialog
        const amount = parseFloat(approvalDetails.approvedAmount);
        const rate = parseFloat(approvalDetails.interestRate);
        if (isNaN(amount) || amount <= 0) { showSnackbar('Approved amount must be a positive number.', 'warning'); return; }
        if (isNaN(rate) || rate <= 0.1) { showSnackbar('Interest rate must be positive (e.g., > 0.1%).', 'warning'); return; }

        setActionLoadingId(currentLoan.id); // Indicate loading for this specific loan
        setError('');
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/loan/approve/${currentLoan.id}`,
                { approvedAmount: amount, interestRate: rate },
                { withCredentials: true }
            );
            showSnackbar(response.data?.message || `Loan ${currentLoan.id} approved successfully!`, 'success');
            closeApproveDialog();
            fetchPendingLoans(); // Refresh the list
        } catch (err) {
             console.error(`Error approving Loan ${currentLoan.id}:`, err);
             const errorMsg = err.response?.data?.message || `Failed to approve Loan ${currentLoan.id}.`;
             showSnackbar(errorMsg, 'error'); // Show error in snackbar
             // Consider if dialog should stay open on error
        } finally {
             setActionLoadingId(null); // Stop loading indicator for this loan
        }
    };

     const handleReject = async () => {
         if (!rejectionReason.trim()) { // Ensure reason is not just whitespace
             showSnackbar('Please provide a non-empty rejection reason.', 'warning');
             return;
         }
         setActionLoadingId(currentLoan.id);
         setError('');
         try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/loan/reject/${currentLoan.id}`,
                { reason: rejectionReason },
                { withCredentials: true }
            );
            showSnackbar(response.data?.message || `Loan ${currentLoan.id} rejected successfully.`, 'success');
            closeRejectDialog();
            fetchPendingLoans(); // Refresh
        } catch (err) {
             console.error(`Error rejecting Loan ${currentLoan.id}:`, err);
             const errorMsg = err.response?.data?.message || `Failed to reject Loan ${currentLoan.id}.`;
             showSnackbar(errorMsg, 'error');
             setError(errorMsg); // Might show main error as well
        } finally {
             setActionLoadingId(null);
        }
     };

    // Render access denied if not admin
    if (!authState.isLoggedIn || authState.userRole !== 'ROLE_ADMIN') {
         return (
             <Container maxWidth="md" sx={{ mt: 4 }}>
                 <Alert severity="error">Access Denied. You do not have permission to view this page.</Alert>
             </Container>
         );
     }

    // Main Render
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                 {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                     <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Pending Loan Applications</Typography>
                     <Box>
                         <Tooltip title="Refresh List">
                            <IconButton onClick={fetchPendingLoans} disabled={isLoading || !!actionLoadingId} color="primary" sx={{ mr: 1 }}>
                                <RefreshIcon />
                             </IconButton>
                         </Tooltip>
                         <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</Button>
                     </Box>
                 </Box>

                {/* Loading / Error / Snackbar */}
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                     <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                         {snackbar.message}
                     </Alert>
                 </Snackbar>

                {/* Table */}
                {!isLoading && !error && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table stickyHeader aria-label="collapsible pending loan applications table">
                             <TableHead sx={{ backgroundColor: 'primary.lighter', '& th': { fontWeight: 'bold', color: 'primary.contrastText' } }}>
                                <TableRow>
                                     <TableCell /> {/* Collapse icon */}
                                    <TableCell>ID</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell>Loan Type</TableCell>
                                    <TableCell align="right">Requested Amt</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingLoans.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, fontStyle: 'italic', color: 'text.secondary' }}>No pending loan applications found.</TableCell></TableRow>
                                ) : (
                                    pendingLoans.map((loan) => (
                                        <PendingLoanRow
                                            key={loan.id}
                                            loan={loan}
                                            onApproveClick={openApproveDialog}
                                            onRejectClick={openRejectDialog}
                                            actionLoadingId={actionLoadingId} // Pass loading ID
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Approval Dialog */}
             <Dialog open={approveDialogOpen} onClose={closeApproveDialog} maxWidth="xs" fullWidth>
                 <DialogTitle>Approve Loan (ID: {currentLoan?.id})</DialogTitle>
                 <DialogContent>
                     <DialogContentText sx={{mb: 1}}>Requested: {formatCurrency(currentLoan?.requestedAmount)}</DialogContentText>
                     <TextField
                         autoFocus
                         margin="dense"
                         id="approvedAmount"
                         name="approvedAmount"
                         label="Approved Amount (₹)"
                         type="number"
                         fullWidth
                         variant="outlined"
                         value={approvalDetails.approvedAmount}
                         onChange={(e) => setApprovalDetails({...approvalDetails, approvedAmount: e.target.value})}
                         required
                         sx={{ mb: 2 }}
                         inputProps={{ min: "1" }}
                     />
                     <TextField
                         margin="dense"
                         id="interestRate"
                         name="interestRate"
                         label="Annual Interest Rate (%)"
                         type="number"
                         fullWidth
                         variant="outlined"
                         value={approvalDetails.interestRate}
                         onChange={(e) => setApprovalDetails({...approvalDetails, interestRate: e.target.value})}
                         required
                         inputProps={{ step: "0.01", min: "0.1" }}
                     />
                 </DialogContent>
                 <DialogActions sx={{p: '16px 24px'}}>
                    <Button onClick={closeApproveDialog} disabled={actionLoadingId === currentLoan?.id}>Cancel</Button>
                     <Button
                        onClick={handleApprove}
                        color="success"
                        variant="contained"
                        disabled={actionLoadingId === currentLoan?.id || !approvalDetails.approvedAmount || !approvalDetails.interestRate || parseFloat(approvalDetails.approvedAmount) <= 0 || parseFloat(approvalDetails.interestRate) <= 0}
                      >
                         {actionLoadingId === currentLoan?.id ? <CircularProgress size={20} color="inherit"/> : 'Confirm Approval'}
                     </Button>
                 </DialogActions>
             </Dialog>

             {/* Rejection Dialog */}
              <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
                 <DialogTitle>Reject Loan (ID: {currentLoan?.id})</DialogTitle>
                 <DialogContent>
                     <DialogContentText sx={{mb: 2}}>Please provide a reason for rejection.</DialogContentText>
                     <TextField
                         autoFocus
                         margin="dense"
                         id="rejectionReason"
                         label="Rejection Reason"
                         type="text"
                         fullWidth
                         multiline
                         rows={3}
                         variant="outlined"
                         value={rejectionReason}
                         onChange={(e) => setRejectionReason(e.target.value)}
                         required
                     />
                 </DialogContent>
                 <DialogActions sx={{p: '16px 24px'}}>
                     <Button onClick={closeRejectDialog} disabled={actionLoadingId === currentLoan?.id}>Cancel</Button>
                     <Button
                        onClick={handleReject}
                        color="error"
                        variant="contained"
                        disabled={actionLoadingId === currentLoan?.id || !rejectionReason.trim()}
                     >
                         {actionLoadingId === currentLoan?.id ? <CircularProgress size={20} color="inherit"/> : 'Confirm Rejection'}
                     </Button>
                 </DialogActions>
             </Dialog>

        </Container>
    );
}