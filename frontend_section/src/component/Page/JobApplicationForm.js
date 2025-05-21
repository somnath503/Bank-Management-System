// --- src/component/Page/JobApplicationForm.js ---
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import MUI components
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Grid, // Keep Grid for layout, even if vertical
    Paper
} from '@mui/material';

const API_BASE_URL = 'http://localhost:8080'; // Your backend URL

export default function JobApplicationForm() {
    const navigate = useNavigate(); // To potentially redirect after success

    // State for form data
    const [formData, setFormData] = useState({
        applicantFirstName: '',
        applicantLastName: '',
        applicantEmail: '',
        applicantPhone: '',
        qualifications: '',
        experience: '',
        desiredRole: '',
        resumeLink: ''
    });

    // State for loading and feedback messages
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear messages when user types
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        // Basic Frontend Validation (Backend validation is primary)
        if (!formData.applicantFirstName || !formData.applicantLastName || !formData.applicantEmail || !formData.applicantPhone || !formData.qualifications || !formData.desiredRole) {
            setErrorMessage('Please fill in all required fields marked with *.');
            setIsLoading(false);
            return;
        }

        console.log("Submitting Job Application Data:", formData);

        try {
            // Send data to the backend public endpoint (/apply-for-job)
            const response = await axios.post(`${API_BASE_URL}/apply-for-job`, formData);
            // No need for `withCredentials: true` here as it's a public submission

            console.log("Application submission successful:", response.data);
            setSuccessMessage(response.data?.message || "Application submitted successfully! We will contact you if you are shortlisted.");

            // Clear the form after successful submission
            setFormData({
                applicantFirstName: '', applicantLastName: '', applicantEmail: '',
                applicantPhone: '', qualifications: '', experience: '',
                desiredRole: '', resumeLink: ''
            });

            // Optional: Redirect after a delay
            // setTimeout(() => navigate('/'), 3000); // Redirect to home after 3 secs

        } catch (error) {
            // Enhanced Error Logging (Keep this)
            console.error("Application submission error:", error);
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                console.error("Error Response Status:", error.response.status);
                let backendMessage = error.response.data?.message ||
                                   (typeof error.response.data === 'string' ? error.response.data : null);
                setErrorMessage(backendMessage || `Submission failed (Status: ${error.response.status}). Please check details and try again.`);
            } else if (error.request) {
                console.error("Error Request:", error.request);
                setErrorMessage("Network error. Could not reach the server.");
            } else {
                console.error('Error Message:', error.message);
                setErrorMessage(`An unexpected error occurred: ${error.message}`);
            }
            // --- End Enhanced Logging ---
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Main container, centers the Paper component
        <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
            {/* White background Paper component */}
            <Paper elevation={3} sx={{
                p: { xs: 2, sm: 4 }, // Responsive padding
                borderRadius: '12px',
                backgroundColor: '#ffffff', // Explicit white background
                width: '100%', // Takes the width of the maxWidth container
                display: 'flex',
                flexDirection: 'column', // Stack elements vertically inside Paper
                alignItems: 'center' // Center items horizontally within Paper
            }}>
                {/* Title */}
                <Typography component="h1" variant="h4" align="center" gutterBottom sx={{
                     fontWeight: 'bold',
                     color: '#000000', // Black text
                     width: '100%' // Ensure title takes full width for centering
                     }}>
                    Apply for a Position
                </Typography>
                {/* Subtitle */}
                <Typography variant="body1" align="center" color="text.secondary" sx={{
                     mb: 4,
                     color: '#333333' // Dark grey text
                     }}>
                    Fill out the form below to apply for a job at MEEWOO BANK. Fields marked with * are required.
                </Typography>

                {/* Feedback Messages */}
                {successMessage && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }} variant="outlined">{successMessage}</Alert> // Outlined Alert
                )}
                {errorMessage && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }} variant="outlined">{errorMessage}</Alert> // Outlined Alert
                )}

                {/* Form container */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* All TextFields arranged vertically */}
                    {/* Each TextField will take full width by default */}

                    <TextField name="applicantFirstName" required fullWidth id="applicantFirstName" label="First Name *" // Added * to label
                        value={formData.applicantFirstName} onChange={handleChange} disabled={isLoading}
                        autoComplete="given-name" autoFocus
                    />

                    <TextField name="applicantLastName" required fullWidth id="applicantLastName" label="Last Name *"
                        value={formData.applicantLastName} onChange={handleChange} disabled={isLoading}
                        autoComplete="family-name"
                    />

                    <TextField name="applicantEmail" required fullWidth id="applicantEmail" label="Email Address *" type="email"
                        value={formData.applicantEmail} onChange={handleChange} disabled={isLoading}
                        autoComplete="email"
                    />

                    <TextField name="applicantPhone" required fullWidth id="applicantPhone" label="Phone Number *" type="tel"
                        value={formData.applicantPhone} onChange={handleChange} disabled={isLoading}
                        autoComplete="tel"
                    />

                    <TextField name="desiredRole" required fullWidth id="desiredRole" label="Desired Role / Position *"
                        value={formData.desiredRole} onChange={handleChange} disabled={isLoading}
                        helperText="E.g., Teller, Loan Officer, IT Support"
                    />

                    <TextField name="qualifications" required fullWidth id="qualifications" label="Qualifications / Education *"
                        value={formData.qualifications} onChange={handleChange} disabled={isLoading}
                        multiline rows={4}
                        helperText="Summarize relevant education, certifications, skills."
                    />

                    <TextField name="experience" fullWidth id="experience" label="Work Experience (Optional)"
                        value={formData.experience} onChange={handleChange} disabled={isLoading}
                        multiline rows={4}
                        helperText="Describe relevant work history, roles, responsibilities."
                    />

                    <TextField name="resumeLink" fullWidth id="resumeLink" label="Link to Resume/CV/Portfolio (Optional)"
                        value={formData.resumeLink} onChange={handleChange} disabled={isLoading}
                        helperText="E.g., LinkedIn profile or shared document link"
                    />

                    {/* Submit Button - Centered */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}> {/* Reduced top margin */}
                        <Button type="submit" variant="contained" color="primary"
                            sx={{ py: 1.5, px: 5, fontSize: '1rem' }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
                        </Button>
                    </Box>
                </Box> {/* End Form Box */}
            </Paper> {/* End Paper */}
        </Container> // End Container
    );
}