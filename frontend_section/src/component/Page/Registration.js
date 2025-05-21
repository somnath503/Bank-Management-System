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
    Grid // Grid is essential for responsiveness
} from '@mui/material';

export default function Registration() {
    const navigate = useNavigate();

    // --- State Management (same as before) ---
    const [formData, setFormData] = useState({
        mobileNumber: '', email: '', fname: '', lname: '', fathername: '',
        address: '', pincode: '', dob: '', password: '', confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Handlers (same as before) ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        const { confirmPassword, ...dataToSend } = formData;

        console.log("Submitting Registration Data:", dataToSend);

        try {
            const response = await axios.post("http://localhost:8080/register", dataToSend);
            console.log("Registration successful:", response.data);
            setSuccessMessage(response.data?.message || "Registration successful! Redirecting to login...");
            setFormData({ // Clear form
                 mobileNumber: '', email: '', fname: '', lname: '', fathername: '',
                 address: '', pincode: '', dob: '', password: '', confirmPassword: ''
            });
            setTimeout(() => navigate('/login'), 2500); // Redirect after showing message

        } catch (error) {
            console.error("Registration error:", error);
             if (error.response) {
                setErrorMessage(error.response.data?.message || error.response.data || `Registration failed (Status: ${error.response.status})`);
            } else if (error.request) {
                setErrorMessage("Network error. Could not reach the server.");
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Responsive JSX with Vertical Inputs ---
    return (
        // Use maxWidth="sm" for a narrower form if all inputs are vertical, or keep "md"
        <Container component="main" maxWidth="sm"> {/* Adjusted maxWidth for better vertical form appearance */}
            <Box
                sx={{
                    marginTop: 8, // More top margin for better spacing
                    marginBottom: 4, // Add bottom margin
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: { xs: 2, sm: 3 }, // Add some padding inside the box, responsive
                    border: '1px solid', // Optional: add border/shadow for visual grouping
                    borderColor: 'divider',
                    borderRadius: 2, // Optional: rounded corners
                    // boxShadow: 3, // Optional: subtle shadow
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}> {/* Add bottom margin to title */}
                    Register New Account
                </Typography>

                {/* Feedback Messages */}
                {successMessage && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>
                )}
                {errorMessage && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{errorMessage}</Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}> {/* Ensure form box takes full width of container */}
                    {/* Grid container to manage layout */}
                    {/* spacing={2} adds space between grid items */}
                    <Grid container spacing={2}>

                        {/* First Name: Full width on all screens */}
                        <Grid item xs={12}>
                            <TextField name="fname" required fullWidth id="fname" label="First Name"
                                value={formData.fname} onChange={handleChange} disabled={isLoading}
                                autoComplete="given-name" autoFocus />
                        </Grid>

                        {/* Last Name: Full width on all screens */}
                        <Grid item xs={12}>
                            <TextField name="lname" required fullWidth id="lname" label="Last Name"
                                value={formData.lname} onChange={handleChange} disabled={isLoading}
                                autoComplete="family-name" />
                        </Grid>

                        {/* Father's Name: Always full width */}
                        <Grid item xs={12}>
                            <TextField name="fathername" required fullWidth id="fathername" label="Father's Name"
                                value={formData.fathername} onChange={handleChange} disabled={isLoading} />
                        </Grid>

                        {/* Email: Full width on all screens */}
                        <Grid item xs={12}>
                             <TextField name="email" required fullWidth id="email" label="Email Address" type="email"
                                value={formData.email} onChange={handleChange} disabled={isLoading}
                                autoComplete="email" />
                        </Grid>

                        {/* Mobile Number: Full width on all screens */}
                        <Grid item xs={12}>
                            <TextField name="mobileNumber" required fullWidth id="mobileNumber" label="Mobile Number" type="tel"
                                value={formData.mobileNumber} onChange={handleChange} disabled={isLoading}
                                autoComplete="tel" />
                        </Grid>

                        {/* Address: Always full width, multiline */}
                         <Grid item xs={12}>
                            <TextField name="address" required fullWidth id="address" label="Full Address"
                                value={formData.address} onChange={handleChange} disabled={isLoading}
                                multiline rows={3} />
                        </Grid>

                        {/* Pincode: Full width on all screens */}
                         <Grid item xs={12}>
                           <TextField name="pincode" required fullWidth id="pincode" label="Pincode" type="text"
                                value={formData.pincode} onChange={handleChange} disabled={isLoading}
                                autoComplete="postal-code" />
                        </Grid>

                        {/* Date of Birth: Full width on all screens */}
                        <Grid item xs={12}>
                            <TextField name="dob" required fullWidth id="dob" label="Date of Birth" type="date"
                                value={formData.dob} onChange={handleChange} disabled={isLoading}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>

                        {/* Password: Always full width */}
                        <Grid item xs={12}>
                            <TextField name="password" required fullWidth id="password" label="Password" type="password"
                                value={formData.password} onChange={handleChange} disabled={isLoading}
                                error={!!errorMessage && errorMessage.toLowerCase().includes('password')}
                                autoComplete="new-password" />
                        </Grid>

                         {/* Confirm Password: Always full width */}
                         <Grid item xs={12}>
                            <TextField name="confirmPassword" required fullWidth id="confirmPassword" label="Confirm Password" type="password"
                                value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
                                error={!!errorMessage && errorMessage.toLowerCase().includes('password')}
                                autoComplete="new-password" />
                        </Grid>
                    </Grid> {/* End Grid container */}

                    {/* Submit Button */}
                    <Button type="submit" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2, bgcolor: '#28a745', '&:hover': { bgcolor: '#218838' } }}
                        disabled={isLoading} >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>

                    {/* Link back to Login */}
                     <Grid container justifyContent="center"> {/* Aligns item to the center */}
                         <Grid item>
                            <Button variant="text" onClick={() => navigate('/login')} disabled={isLoading} >
                                Already have an account? Login
                            </Button>
                         </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}