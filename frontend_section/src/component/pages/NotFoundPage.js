import React from 'react';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Import an icon

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <ErrorOutlineIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom>
                    404 - Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Oops! The page you are looking for does not exist or may have been moved.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Paper>
        </Container>
    );
};

export default NotFoundPage;