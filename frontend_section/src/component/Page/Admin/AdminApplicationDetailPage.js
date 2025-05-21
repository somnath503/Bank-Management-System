// --- src/component/Page/Admin/AdminApplicationDetailPage.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Box, Button, CircularProgress, Alert, Grid, TextField,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, Tooltip, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Hired
import CancelIcon from '@mui/icons-material/Cancel'; // Rejected
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Pending/Review


const API_BASE_URL = 'http://localhost:8080';

// Helper functions (reuse from List page if possible)
const formatDateTime = (dateTimeString) => { /* ... same as in List page ... */ };
const getStatusChip = (status) => { /* ... same as in List page ... */ };

export default function AdminApplicationDetailPage() {
    const { appId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false); // For button actions
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // State for modals/dialogs
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [interviewDate, setInterviewDate] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchApplicationDetails = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setFeedback({ type: '', message: '' });
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/applications/${appId}`, {
                withCredentials: true,
            });
            if (response.data) {
                setApplication(response.data);
            } else {
                throw new Error("Application not found or invalid response.");
            }
        } catch (err) {
            console.error("Error fetching application details:", err);
            setError(err.response?.data?.message || err.message || 'Failed to load application details.');
        } finally {
            setIsLoading(false);
        }
    }, [appId]);

    useEffect(() => {
        fetchApplicationDetails();
    }, [fetchApplicationDetails]);

    // --- Action Handlers ---

    const handleScheduleInterview = async () => {
        if (!interviewDate) {
            setFeedback({ type: 'error', message: 'Please select an interview date and time.' });
            return;
        }
        setActionLoading(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/applications/${appId}/schedule-interview`,
                { interviewDate: interviewDate }, // Send as ISO string if backend expects LocalDateTime
                { withCredentials: true }
            );
             setFeedback({ type: 'success', message: 'Interview scheduled successfully!' });
             setApplication(response.data); // Update application state with new data
             setOpenScheduleDialog(false);
             setInterviewDate(''); // Reset date field
        } catch (err) {
             console.error("Error scheduling interview:", err);
             setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to schedule interview.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectApplication = async () => {
         if (!rejectionReason) {
             setFeedback({ type: 'error', message: 'Please provide a rejection reason.' });
             return;
         }
         setActionLoading(true);
         setFeedback({ type: '', message: '' });
         try {
             const response = await axios.post(
                 `${API_BASE_URL}/admin/applications/${appId}/reject`,
                 { reason: rejectionReason },
                 { withCredentials: true }
             );
              setFeedback({ type: 'success', message: 'Application rejected successfully.' });
              setApplication(response.data); // Update application state
              setOpenRejectDialog(false);
              setRejectionReason(''); // Reset reason field
         } catch (err) {
             console.error("Error rejecting application:", err);
             setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to reject application.' });
         } finally {
             setActionLoading(false);
         }
    };

     const handleHireApplicant = async () => {
        if (!window.confirm("Are you sure you want to mark this applicant as hired and create an employee account?")) {
             return;
         }
         setActionLoading(true);
         setFeedback({ type: '', message: '' });
         try {
             const response = await axios.post(
                 `${API_BASE_URL}/admin/applications/${appId}/hire`,
                 null, // No body needed for hire action itself
                 { withCredentials: true }
             );
              setFeedback({ type: 'success', message: 'Applicant hired successfully! Employee account created.' });
              setApplication(response.data); // Update application state
         } catch (err) {
             console.error("Error hiring applicant:", err);
             setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to hire applicant. Check if email/mobile already exist.' });
         } finally {
             setActionLoading(false);
         }
     };


    // --- Render Logic ---

    if (isLoading) {
        return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/applications')} sx={{ mt: 2 }}>
                    Back to List
                </Button>
            </Container>
        );
    }

    if (!application) {
        return <Container sx={{ textAlign: 'center', mt: 5 }}><Typography>Application not found.</Typography></Container>;
    }

    // Determine if actions should be enabled based on status
    const canSchedule = !['HIRED', 'REJECTED'].includes(application.status);
    const canReject = !['HIRED', 'REJECTED'].includes(application.status);
    const canHire = application.status === 'INTERVIEW_SCHEDULED'; // Example: Only hire after interview

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                {/* Header and Back Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Application Details
                    </Typography>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/applications')}>
                        Back to List
                    </Button>
                </Box>

                {/* Feedback Alert */}
                {feedback.message && (
                    <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* Application Info Grid */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Applicant Information</Typography>
                        <Typography><strong>Name:</strong> {application.applicantFirstName} {application.applicantLastName}</Typography>
                        <Typography><strong>Email:</strong> {application.applicantEmail}</Typography>
                        <Typography><strong>Phone:</strong> {application.applicantPhone}</Typography>
                        <Typography><strong>Applied On:</strong> {formatDateTime(application.applicationDate)}</Typography>
                         <Typography sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <strong>Status:</strong>  {getStatusChip(application.status)}
                         </Typography>
                          {application.interviewDate && (
                             <Typography sx={{ mt: 1 }}><strong>Interview Scheduled:</strong> {formatDateTime(application.interviewDate)}</Typography>
                         )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Professional Details</Typography>
                        <Typography><strong>Desired Role:</strong> {application.desiredRole}</Typography>
                         <Typography><strong>Qualifications:</strong></Typography>
                         <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', p: 1, borderRadius: 1 }}>{application.qualifications || 'N/A'}</Typography>
                        <Typography sx={{mt:1}}><strong>Experience:</strong></Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', p: 1, borderRadius: 1 }}>{application.experience || 'N/A'}</Typography>
                        {application.resumeLink && <Typography sx={{mt:1}}><strong>Resume/Link:</strong> <a href={application.resumeLink} target="_blank" rel="noopener noreferrer">{application.resumeLink}</a></Typography>}
                    </Grid>
                      {application.adminNotes && (
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Admin Notes</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', p: 1, borderRadius: 1, background: '#f9f9f9' }}>
                                {application.adminNotes}
                                {application.reviewerAdminId && ` (by Admin: ${application.reviewerAdminId})`}
                            </Typography>
                        </Grid>
                     )}
                </Grid>

                 {/* Action Buttons */}
                 <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {canSchedule && (
                         <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ScheduleIcon />}
                            onClick={() => setOpenScheduleDialog(true)}
                            disabled={actionLoading}
                         >
                            Schedule Interview
                         </Button>
                     )}
                    {canReject && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<ThumbDownAltIcon />}
                             onClick={() => setOpenRejectDialog(true)}
                             disabled={actionLoading}
                        >
                            Reject Application
                        </Button>
                     )}
                     {canHire && ( // Only show hire if appropriate (e.g., after interview)
                         <Button
                            variant="contained"
                            color="success"
                            startIcon={<ThumbUpAltIcon />}
                             onClick={handleHireApplicant}
                             disabled={actionLoading}
                        >
                             {actionLoading ? <CircularProgress size={20} color="inherit"/> : 'Hire Applicant'}
                         </Button>
                     )}
                </Box>
            </Paper>

             {/* Schedule Interview Dialog */}
             <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)}>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the date and time for the interview.
                    </DialogContentText>
                     {feedback.type === 'error' && <Alert severity="error" sx={{ mb: 1 }}>{feedback.message}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="interviewDate"
                        label="Interview Date and Time"
                        type="datetime-local" // Use datetime-local input
                        fullWidth
                        variant="standard"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                 </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenScheduleDialog(false)} disabled={actionLoading}>Cancel</Button>
                    <Button onClick={handleScheduleInterview} disabled={actionLoading}>
                         {actionLoading ? <CircularProgress size={20} /> : 'Schedule'}
                     </Button>
                 </DialogActions>
             </Dialog>

            {/* Reject Application Dialog */}
             <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                 <DialogTitle>Reject Application</DialogTitle>
                 <DialogContent>
                    <DialogContentText>
                        Please provide a reason for rejecting this application. This will be recorded in the notes.
                     </DialogContentText>
                     {feedback.type === 'error' && <Alert severity="error" sx={{ mb: 1 }}>{feedback.message}</Alert>}
                     <TextField
                        autoFocus
                        margin="dense"
                        id="rejectionReason"
                        label="Rejection Reason"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="standard"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                     />
                 </DialogContent>
                 <DialogActions>
                     <Button onClick={() => setOpenRejectDialog(false)} disabled={actionLoading}>Cancel</Button>
                     <Button onClick={handleRejectApplication} color="error" disabled={actionLoading}>
                         {actionLoading ? <CircularProgress size={20} /> : 'Confirm Rejection'}
                     </Button>
                 </DialogActions>
            </Dialog>

        </Container>
    );
}