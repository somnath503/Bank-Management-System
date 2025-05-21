import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ Get login() from context

// Material UI Components
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Paper // Import Paper for background styling
} from '@mui/material';

export default function Customer_Dash() {
    const navigate = useNavigate();
    const { login } = useAuth(); // ✅ Use login from context

    const [formData, setFormData] = useState({
        customerId: '',
        mobileNumber: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        const loginData = {
            customerId: formData.customerId,
            mobileNumber: formData.mobileNumber,
            password: formData.password
        };

        try {
            const response = await axios.post("http://localhost:8080/login", loginData);
            console.log("Login Response:", response.data);

            // ✅ Check for success and extract role + ID
            if (response.data === true || response.data?.success === true) {
                const role = response.data?.role;
                const customerId = response.data?.customerId;

                if (!role || !customerId) {
                    setErrorMessage("Login failed: Invalid response from server.");
                    setIsLoading(false);
                    return;
                }

                login(role, customerId); // ✅ Save login info in context

                // ✅ Navigate based on role
                 // *** FIX: Added ROLE_EMPLOYEE navigation ***
                if (role === 'ROLE_ADMIN') {
                    navigate('/admin/dashboard');
                } else if (role === 'ROLE_EMPLOYEE') {
                    navigate('/employee/dashboard'); // Navigate employees to their dashboard
                }
                else if (role === 'ROLE_USER') {
                    navigate('/header');
                } else {
                    // Fallback for unknown roles or if navigation is needed before role determination
                    navigate('/');
                }
            } else {
                // Use message from backend response if available
                setErrorMessage(response.data?.message || "Login failed. Please check credentials or account status.");
            }
        } catch (error) {
             // Improved error message handling
            if (error.response) {
                 console.error("Login Error Response:", error.response);
                 const status = error.response.status;
                 const responseData = error.response.data;
                 let msg = `Login failed (Status: ${status})`; // Default for other errors

                if (status === 401) { // Unauthorized
                     // Use specific message from backend if available, otherwise generic
                     msg = responseData?.message || "Invalid credentials or account pending approval/disabled.";
                 } else if (responseData?.message) { // Use message from {success: false, message: '...'}
                     msg = responseData.message;
                 } else if (typeof responseData === 'string') { // If backend just sent a string error
                     msg = responseData;
                 }
                 setErrorMessage(msg);
             } else if (error.request) {
                 console.error("Login Network Error:", error.request);
                 setErrorMessage("Network error: Could not reach the server.");
             } else {
                 console.error("Login Setup Error:", error.message);
                 setErrorMessage("An unexpected error occurred during login setup.");
             }
        } finally {
            setIsLoading(false);
        }
    };

    const redirectToRegistration = () => {
        navigate("/register");
    };

    return (
        // Container to center content, adjust maxWidth as needed
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            {/* Paper component to provide the white background and elevation */}
            <Paper elevation={4} sx={{
                padding: { xs: 2, sm: 4 }, // Responsive padding
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', // Ensure Paper takes container width
                backgroundColor: '#ffffff', // Explicitly set white background
                borderRadius: '12px' // Optional: slightly rounded corners
            }}>
                <Typography component="h1" variant="h5" sx={{ color: '#000000', mb: 1 }}> {/* Black text */}
                    Customer Login
                </Typography>

                {/* Error message display */}
                {errorMessage && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {errorMessage}
                    </Alert>
                )}

                {/* Form Box */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="customerId"
                        label="Customer ID"
                        name="customerId"
                        autoComplete="username"
                        autoFocus
                        value={formData.customerId}
                        onChange={handleChange}
                        disabled={isLoading}
                         // Optional: Style input text/label if needed for contrast
                         // InputLabelProps={{ sx: { color: 'rgba(0, 0, 0, 0.6)' } }}
                         // InputProps={{ sx: { color: '#000000' } }}
                    />

                    {/* Optional Mobile Number */}
                    <TextField
                        margin="normal"
                        fullWidth
                        id="mobileNumber"
                        label="Mobile Number (Optional)"
                        name="mobileNumber"
                        autoComplete="tel"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    {/* Sign In Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 1 }} // Adjust margins as needed
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    {/* Register Button */}
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined" // Keep outlined for secondary action
                        sx={{ mb: 2 }}
                        onClick={redirectToRegistration}
                        disabled={isLoading}
                    >
                        Register New Account
                    </Button>
                </Box>
            </Paper> {/* End Paper component */}
        </Container>
    );
}