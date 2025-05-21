
import React from 'react'; // Only React needed now
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink for navigation
import SavingsIcon from '@mui/icons-material/Savings'; // <<< ADD THIS LIN

import {
    Container, Typography, Box, Button, Paper, Grid, Card, CardContent, CardActions
} from '@mui/material';
// Import MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // For Customers Approvals card
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // For Job Applications card
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // For Employee Actions card
import CreditScoreIcon from '@mui/icons-material/CreditScore';
// ... other imports ...

export default function AdminDashboardPage() {
    // Removed ALL state, useEffect, useCallback, and functions related to
    // fetching or handling pending customers. This component is now purely presentational/navigational.

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Dashboard Header */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, textAlign: 'center', background: 'linear-gradient(45deg, #673ab7 30%, #3f51b5 90%)', color: 'white' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Select an area to manage customer accounts, job applications, or perform employee actions.
                </Typography>
            </Paper>

            {/* Action Cards Grid - Now centered */}
            <Grid container spacing={4} justifyContent="center" alignItems="stretch">

                {/* Card 1: Customer Approvals */}
                <Grid item xs={12} sm={6} md={4}> {/* Cards can now take up more space if needed */}
                    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }, transition: 'box-shadow 0.3s, transform 0.3s', borderTop: '4px solid', borderColor: 'primary.main' }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                            <PeopleAltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                                Customer Approvals
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                                View and manage pending customer registrations.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                component={RouterLink}
                                // Ensure path matches App.js route for PendingApprovalsPage
                                to="/admin/pending"
                                size="medium"
                                variant="contained"
                                color="primary"
                            >
                                Manage Customers
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Card 2: Job Applications */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }, transition: 'box-shadow 0.3s, transform 0.3s', borderTop: '4px solid', borderColor: 'secondary.main' }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                            <WorkOutlineIcon color="secondary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                                Job Applications
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                                Review submitted applications and manage hiring.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                component={RouterLink}
                                to="/admin/applications" // Link to the applications list page
                                size="medium"
                                variant="contained"
                                color="secondary"
                            >
                                Manage Applications
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Card 3: Employee Actions Portal */}
                <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }, transition: 'box-shadow 0.3s, transform 0.3s', borderTop: '4px solid', borderColor: 'success.main' }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                             <ManageAccountsIcon sx={{ fontSize: 60, mb: 2, color: 'success.main' }} />
                             <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                                Employee Actions
                             </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                                Access employee functions (deposit, withdrawal, etc.).
                             </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                component={RouterLink}
                                to="/employee/dashboard" // Link to the main employee dashboard
                                size="medium"
                                variant="contained"
                                color="success"
                            >
                                Go to Employee Portal
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                     <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }, transition: 'box-shadow 0.3s ease, transform 0.3s ease', borderTop: '4px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                             <CreditScoreIcon sx={{ fontSize: 50, mb: 1.5, color: 'warning.main' }} /> {/* Loan Icon */}
                             <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                                Loan Approvals
                             </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px', px: 1 }}>
                                Review and approve/reject pending Loan Applications.
                             </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                            <Button
                                component={RouterLink}
                                to="/admin/loan/pending" // Link to the Admin Loan Pending Page
                                size="medium"
                                variant="contained"
                                color="warning" // Use a distinct color
                            >
                                Manage Loans
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Card 3: Fixed Deposit Approvals */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }, /* ... other styles ... */ borderTop: '4px solid', borderColor: 'info.main', borderRadius: 2 }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                             <SavingsIcon sx={{ fontSize: 50, mb: 1.5, color: 'info.main' }} />
                             <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                                FD Approvals
                             </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px', px: 1 }}>
                                Review and approve/reject pending Fixed Deposits.
                             </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                            <Button component={RouterLink} to="/admin/fd/pending" size="medium" variant="contained" color="info">
                                Manage FDs
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
                {/* Removed the duplicate "Customer Section" card from your last input */}

            </Grid> {/* End Action Cards Grid */}

            {/* No Table or Snackbar needed here anymore */}

        </Container>
    );
}