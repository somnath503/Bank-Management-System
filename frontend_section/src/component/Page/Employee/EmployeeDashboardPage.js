// --- src/component/Page/Employee/EmployeeDashboardPage.js ---
import React from 'react';
import { Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Path may differ: '../../context/AuthContext'

// Import relevant icons
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Check Balance
import AddCardIcon from '@mui/icons-material/AddCard'; // Deposit
import PaymentsIcon from '@mui/icons-material/Payments'; // Withdrawal
import HistoryIcon from '@mui/icons-material/History'; // Get History

export default function EmployeeDashboardPage() {
    const { authState } = useAuth(); // Get auth state to display welcome message

    // Placeholder content - Replace with actual links and functionality
    // when corresponding pages and backend endpoints are ready.
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Dashboard Header */}
            <Paper elevation={3} sx={{
                 p: { xs: 2, md: 3 },
                 mb: 4,
                 textAlign: 'center',
                 background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)', // Example Green Gradient
                 color: 'white'
            }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Employee Portal
                </Typography>
                {/* Display logged-in employee/admin ID */}
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Welcome, {authState.customerId}! Access customer service tools below.
                </Typography>
            </Paper>

            {/* Action Cards Grid */}
             <Grid container spacing={4} justifyContent="center" alignItems="stretch">

                {/* Card: Deposit */}
                 <Grid item xs={12} sm={6} md={4} lg={3}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                           <AddCardIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
                           <Typography variant="h6" gutterBottom>Deposit Funds</Typography>
                           <Typography variant="caption" color="text.secondary">Make a deposit into a customer's account.</Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            {/* Link to the actual Employee Deposit page */}
                             <Button component={RouterLink} to="/employee/deposit" variant="contained" size="small">Go to Deposit</Button>
                         </CardActions>
                     </Card>
                 </Grid>

                 {/* Card: Withdrawal */}
                 <Grid item xs={12} sm={6} md={4} lg={3}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                         <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                           <PaymentsIcon fontSize="large" color="secondary" sx={{ mb: 1 }}/>
                           <Typography variant="h6" gutterBottom>Withdraw Funds</Typography>
                            <Typography variant="caption" color="text.secondary">Process a withdrawal from a customer's account.</Typography>
                        </CardContent>
                         <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                             {/* Link to the actual Employee Withdrawal page */}
                              <Button component={RouterLink} to="/employee/withdraw" variant="contained" color="secondary" size="small">Go to Withdrawal</Button>
                         </CardActions>
                     </Card>
                 </Grid>

                 {/* Card: Check Balance */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                         <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                           <AccountBalanceIcon fontSize="large" sx={{ color: 'success.main', mb: 1 }} />
                           <Typography variant="h6" gutterBottom>Check Balance</Typography>
                            <Typography variant="caption" color="text.secondary">View the current balance of a customer's account.</Typography>
                        </CardContent>
                         <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            {/* Link to the actual Employee Check Balance page */}
                              <Button component={RouterLink} to="/employee/check-balance" variant="contained" color="success" size="small">Check Balance</Button>
                         </CardActions>
                     </Card>
                 </Grid>

                 {/* Card: Get History */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                         <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                           <HistoryIcon fontSize="large" color="warning" sx={{ mb: 1 }}/>
                            <Typography variant="h6" gutterBottom>Transaction History</Typography>
                            <Typography variant="caption" color="text.secondary">Download a statement of a customer's transactions.</Typography>
                        </CardContent>
                         <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                             {/* Link to the actual Employee Download History page */}
                              <Button component={RouterLink} to="/employee/download-history" variant="contained" color="warning" size="small">Get History</Button>
                         </CardActions>
                     </Card>
                 </Grid>

                 {/* Example Card: Customer Search (Add when implementing) */}
                 {/*
                 <Grid item xs={12} sm={6} md={4} lg={3}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                         <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                           <SearchIcon fontSize="large" color="info" sx={{ mb: 1 }} />
                            <Typography variant="h6" gutterBottom>Find Customer</Typography>
                            <Typography variant="caption" color="text.secondary">Search for customer accounts by ID, name, or number.</Typography>
                        </CardContent>
                         <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                              <Button component={RouterLink} to="/employee/customer-search" variant="contained" color="info" size="small">Search</Button>
                         </CardActions>
                     </Card>
                 </Grid>
                 */}

            </Grid>
        </Container>
    );
}