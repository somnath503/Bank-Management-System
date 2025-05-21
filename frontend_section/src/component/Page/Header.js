// --- src/component/Page/Header.js ---
import React from 'react';
import { Box, Button, Typography, Grid, Card, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { Link as RouterLink, useNavigate } from 'react-router-dom';


// Import Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import SavingsIcon from '@mui/icons-material/Savings';         // <<< ENSURE THIS IS PRESENT
import ViewListIcon from '@mui/icons-material/ViewList';     

const Header = () => {
    const navigate = useNavigate();
    const { logout, authState } = useAuth(); // Get logout and authState

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Placeholder for download
    const handleDownloadHistory = async () => {
         alert('Download Transaction History - Backend endpoint not implemented yet.');
    };


    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
             <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                 <Typography variant="h4" component="h1" gutterBottom align="center">
                    My Account Dashboard
                 </Typography>
                 <Typography variant="body1" paragraph align="center">
                     Welcome, Customer {authState.customerId}!
                 </Typography>
             </Paper>

            {/* --- Action Cards --- */}
            <Grid container spacing={3} justifyContent="center">

                 {/* Card 1: Check Balance (Links to /check-balance page) */}
                 <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100%', '&:hover': { boxShadow: 6 } }}>
                         <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                         <Typography variant="h6" gutterBottom>Check Balance</Typography>
                         {/* Link points to the separate CheckBalancePage route */}
                         <Button component={Link} to="/check-balance" variant="contained">
                             Check Now
                         </Button>
                     </Card>
                 </Grid>

                {/* Card 2: Transfer Money */}
                <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <SwapHorizIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>Transfer Money</Typography>
                        {/* Link points to the separate TransferPage route */}
                        <Button component={Link} to="/transfer" variant="contained" color="secondary">
                            Go to Transfer
                        </Button>
                    </Card>
                </Grid>

                 {/* Card 3: Download History */}
                 <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <DownloadIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                        <Typography variant="h6" gutterBottom>Transactions</Typography>
                        <Button component={Link} to="/history" variant="contained" color="success" fullWidth>
                            Download History
                        </Button>
                    </Card>
                  </Grid>
                    {/* Card 2: Transfer Money */}

                <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <SwapHorizIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>Apply For Loan</Typography>
                        {/* Link points to the separate TransferPage route */}
                        <Button component={Link} to="/apply-loan" variant="contained" color="secondary">
                            Go to apply Loan
                        </Button>
                    </Card>
                </Grid> 

                {/* Card 4: Fixed Deposit */}
                    <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <SavingsIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
                        <Typography variant="h6" gutterBottom>Fixed Deposit</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 'auto' }}>
                            <Button component={RouterLink} to="/apply-fd" variant="contained" color="info" size="small" fullWidth>
                                Apply for New FD
                            </Button>
                            <Button component={RouterLink} to="/my-fds" variant="outlined" color="info" size="small" fullWidth startIcon={<ViewListIcon/>}>
                                View My FDs
                            </Button>
                         </Box>
                    </Card>
                  </Grid>
                {/* ... */}
        
            </Grid>
        </Container>
    );
};

export default Header;