import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Button, CircularProgress, Alert, Snackbar, Box, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, TextField, Tooltip, IconButton, Grid, Chip, Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Adjust path
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// <<< MOVE THE FORMATTERS IMPORT HERE >>>
import { formatDate,  formatDateTime, formatCurrency, getFdStatusChip } from '../../../utils/formatters';

const API_BASE_URL = 'http://localhost:8080'; // Now this is after all imports


// --- PendingFdRow Sub-component (Admin View) ---
function PendingFdRow({ fd, onApproveClick, onRejectClick, actionLoadingId }) {
    const [open, setOpen] = useState(false);
    const isLoading = actionLoadingId === fd.id; // Is action loading for *this* specific row?

    return (
        <React.Fragment>
            {/* Main visible row */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{ width: '5%' }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: '5%' }}>{fd.id}</TableCell>
                <TableCell sx={{ width: '15%' }}>{fd.customerId}</TableCell>
                <TableCell sx={{ width: '20%' }}>{formatDateTime(fd.applicationDate)}</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">{formatCurrency(fd.principalAmount)}</TableCell>
                <TableCell sx={{ width: '10%' }}>{fd.termInMonths} Mo</TableCell>
                <TableCell sx={{ width: '15%' }} align="center">
                    {/* Action Buttons */}
                     <Tooltip title="Approve FD">
                         <span> {/* Wrapper for disabled button tooltip */}
                             <IconButton size="small" onClick={() => onApproveClick(fd.id)} color="success" disabled={isLoading}>
                                {isLoading ? <CircularProgress size={18} color="inherit"/> : <CheckCircleOutlineIcon fontSize='small' />}
                             </IconButton>
                        </span>
                     </Tooltip>
                     <Tooltip title="Reject FD">
                          <span>
                              <IconButton size="small" onClick={() => onRejectClick(fd.id)} color="error" disabled={isLoading}>
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
                                 FD Details (ID: {fd.id}, Customer: {fd.customerId})
                             </Typography>
                            <Grid container spacing={1} sx={{ fontSize: '0.9rem' }}>
                                <Grid item xs={6} sm={4}><strong>Source Acc:</strong> {fd.sourceAccountNumber || 'N/A'}</Grid>
                                <Grid item xs={6} sm={4}><strong>Interest Rate:</strong> {fd.interestRate?.toFixed(2)}%</Grid>
                                <Grid item xs={12} sm={4}><strong>Maturity Amt:</strong> {formatCurrency(fd.maturityAmount)}</Grid>
                                {/* Add any other details relevant for admin review from fd object */}
                            </Grid>
                         </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
// --- End PendingFdRow Sub-component ---


// --- PendingFdsPage Main Component ---
export default function PendingFdsPage() {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [pendingFds, setPendingFds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks which FD action is processing

    // State for rejection dialog
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [currentFdId, setCurrentFdId] = useState(null); // ID of FD for dialog
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch pending FDs
    const fetchPendingFds = useCallback(async () => {
        if (!authState.isLoggedIn || authState.userRole !== 'ROLE_ADMIN') {
            setError("Access Denied: Admin privileges required.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/fd/pending`, { withCredentials: true });
            if (Array.isArray(response.data)) {
                setPendingFds(response.data);
            } else {
                throw new Error("Received unexpected data format from server.");
            }
        } catch (err) {
            console.error("Error fetching pending FDs:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load pending FD applications.');
            setPendingFds([]);
        } finally {
            setIsLoading(false);
        }
    }, [authState.isLoggedIn, authState.userRole]);

    // Fetch on mount
    useEffect(() => {
        fetchPendingFds();
    }, [fetchPendingFds]);

    // Snackbar handlers
    const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };
    const showSnackbar = (message, severity = 'success') => { setSnackbar({ open: true, message, severity }); };

    // --- Dialog Open/Close for Rejection ---
    const openRejectDialog = (fdId) => {
        setCurrentFdId(fdId);
        setRejectionReason(''); // Clear previous reason
        setRejectDialogOpen(true);
    };
    const closeRejectDialog = () => {
        setRejectDialogOpen(false);
        setCurrentFdId(null);
    };

    // --- Action Handlers (Approve & Reject) ---
    const handleApprove = async (fdId) => {
        setActionLoadingId(fdId);
        setError('');
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/fd/approve/${fdId}`, null, { withCredentials: true });
            showSnackbar(response.data?.message || `FD ${fdId} approved successfully!`, 'success');
            fetchPendingFds(); // Refresh the list
        } catch (err) {
             console.error(`Error approving FD ${fdId}:`, err);
             const errorMsg = err.response?.data?.message || `Failed to approve FD ${fdId}. Ensure customer has sufficient balance.`;
             setError(errorMsg); // Show error prominently
             showSnackbar(errorMsg, 'error');
        } finally {
             setActionLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showSnackbar('Please provide a non-empty rejection reason.', 'warning');
            return;
        }
        setActionLoadingId(currentFdId);
        setError('');
        try {
           const response = await axios.post(
               `${API_BASE_URL}/admin/fd/reject/${currentFdId}`,
               { reason: rejectionReason }, // Send reason in request body
               { withCredentials: true }
           );
           showSnackbar(response.data?.message || `FD ${currentFdId} rejected successfully.`, 'success');
           closeRejectDialog();
           fetchPendingFds(); // Refresh
       } catch (err) {
            console.error(`Error rejecting FD ${currentFdId}:`, err);
            const errorMsg = err.response?.data?.message || `Failed to reject FD ${currentFdId}.`;
            showSnackbar(errorMsg, 'error'); // Show error in snackbar
            // Optionally, you could set the main `error` state too, or display error in dialog
       } finally {
            setActionLoadingId(null);
       }
    };

    // Render access denied if not admin
    if (!authState.isLoggedIn || authState.userRole !== 'ROLE_ADMIN') {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">Access Denied. Admin privileges required.</Alert></Container>
        );
    }

    // Main Render
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                 {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Pending Fixed Deposit Applications</Typography>
                    <Box>
                         <Tooltip title="Refresh List">
                            <IconButton onClick={fetchPendingFds} disabled={isLoading || !!actionLoadingId} color="primary" sx={{ mr: 1 }}>
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
                        <Table stickyHeader aria-label="collapsible pending fixed deposit applications table">
                            <TableHead sx={{ backgroundColor: 'primary.lighter', '& th': { fontWeight: 'bold', color: 'primary.contrastText' } }}>
                                <TableRow>
                                     <TableCell /> {/* Collapse icon */}
                                    <TableCell>FD ID</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Applied On</TableCell>
                                    <TableCell align="right">Principal (₹)</TableCell>
                                    <TableCell>Term</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingFds.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, fontStyle: 'italic', color: 'text.secondary' }}>No pending FD applications found.</TableCell></TableRow>
                                ) : (
                                    pendingFds.map((fd) => (
                                        <PendingFdRow
                                            key={fd.id}
                                            fd={fd}
                                            onApproveClick={handleApprove} // Pass ID directly
                                            onRejectClick={openRejectDialog} // Pass ID to open dialog
                                            actionLoadingId={actionLoadingId}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Rejection Reason Dialog */}
             <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} maxWidth="xs" fullWidth>
                 <DialogTitle>Reject FD (ID: {currentFdId})</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>
                        Please provide a reason for rejecting this Fixed Deposit application.
                    </DialogContentText>
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
                    <Button onClick={closeRejectDialog} disabled={actionLoadingId === currentFdId}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        color="error"
                        variant="contained"
                        disabled={actionLoadingId === currentFdId || !rejectionReason.trim()}
                    >
                        {actionLoadingId === currentFdId ? <CircularProgress size={20} color="inherit" /> : 'Confirm Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

// Define helpers if not already globally available or imported
// const formatDateTime = (_dateTimeString) => { /* ... */ };
// const formatCurrency = (_amount) => { /* ... */ };

