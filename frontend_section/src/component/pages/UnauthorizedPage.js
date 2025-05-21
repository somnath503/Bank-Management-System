import React from 'react';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block'; // Import an icon

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <BlockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom color="error">
                    403 - Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Sorry, you do not have the necessary permissions to view this page.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Paper>
        </Container>
    );
};

export default UnauthorizedPage;