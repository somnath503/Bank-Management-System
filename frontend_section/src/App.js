// --- src/App.js ---
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- Component Imports ---

// Common
import Navbar from './component/common/Navbar.js';

// General Pages (assuming src/component/pages/)
import HomePage from './component/pages/Home';
import UnauthorizedPage from './component/pages/UnauthorizedPage';
import NotFoundPage from './component/pages/NotFoundPage';

// Functional Area Pages (assuming src/component/Page/)
import LoginPage from './component/Page/Customer_Dash';
import RegistrationPage from './component/Page/Registration';
// import JobApplicationForm from './component/Page/JobApplicationForm.js';

// Customer Specific Pages (assuming src/component/Page/)
import Header from './component/Page/Header';
import TransferMoney from './component/Page/TransferMoney';
import CheckBalancePage from './component/Page/CheckBalance';
import TransactionHistoryPage from './component/Page/TransactionHistoryPage';

// Admin Specific Pages (assuming src/component/Page/Admin/)
import AdminDashboardPage from './component/Page/Admin/AdminDashboardPage';
import PendingApprovalsPage from './component/Page/Admin/PendingApprovaslPage.js'; // Corrected filename assumption
import AdminApplicationsListPage from './component/Page/Admin/AdminApplicationsListPage';
import AdminApplicationDetailPage from './component/Page/Admin/AdminApplicationDetailPage';
import JobApplicationForm from './component/Page/JobApplicationForm.js';

// Employee Specific Pages (assuming src/component/Page/Employee/)
import EmployeeDashboardPage from './component/Page/Employee/EmployeeDashboardPage';
import EmployeeDepositPage from './component/Page/Employee/EmployeeDepositPage';
import EmployeeWithdrawalPage from './component/Page/Employee/EmployeeWithdrawalPage';
import EmployeeCheckBalancePage from './component/Page/Employee/EmployeeCheckBalancePage';
import ApplyLoanPage from './component/Page/ApplyLoanPage.js'
import MyLoansPage  from './component/Page/MyLoanPage.js';
import PendingLoansPage from './component/Page/Admin/PendingLoansPage.js';
import PendingFdsPage from './component/Page/Admin/PendingFdsPage.js';
import ApplyFDPage from './component/Page/Fd.js';
import MyFdsPage from './component/Page/MyFD.js';

// import EmployeeDownloadHistoryPag from './component/Page/TransactionHistoryPage.js';



// --- Styling Imports ---
import 'bootstrap/dist/css/bootstrap.min.css'; // Keep if still used alongside MUI
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme'; // Your custom MUI theme
import './styles/global.css'; // Your global styles

// --- Protected Route HOC ---
const ProtectedRoute = ({ allowedRoles }) => {
    const { authState } = useAuth();
    // console.log("ProtectedRoute Check:", { isLoggedIn: authState.isLoggedIn, userRole: authState.userRole, allowedRoles });

    if (!authState.isLoggedIn) {
        // Not logged in, redirect to login page, preserving the intended location
        return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }

    // Check if specific roles are required AND if the user has one of the allowed roles
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authState.userRole)) {
        console.warn(`Access Denied: Route requires roles [${allowedRoles.join(', ')}], user has role '${authState.userRole}'`);
        // Logged in, but doesn't have permission for this specific route
        return <Navigate to="/unauthorized" replace />;
    }

    // If logged in AND (no specific roles required OR user has an allowed role), render the nested route
    return <Outlet />; // Outlet renders the matched nested child route
};

// --- Main App Component ---
function App() {
    const { authState } = useAuth();

    // Determine redirect path for already logged-in users trying to access /login
    const getHomeRouteForRole = (role) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return '/admin/dashboard';
            case 'ROLE_EMPLOYEE':
                return '/employee/dashboard';
            case 'ROLE_USER':
                return '/header'; // Customer dashboard
            default:
                return '/'; // Fallback to public home
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Applies baseline MUI styles */}
            <Router>
                <Navbar /> {/* Navbar is always visible */}
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/login"
                        element={
                            authState.isLoggedIn ? (
                                <Navigate to={getHomeRouteForRole(authState.userRole)} replace />
                            ) : (
                                <LoginPage />
                            )
                        }
                    />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/employee" element={<JobApplicationForm />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* --- Customer Routes --- */}
                    {/* Accessible by USER, ADMIN, EMPLOYEE */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_EMPLOYEE']} />}>
                        <Route path="/header" element={<Header />} /> {/* Customer dashboard */}
                        <Route path="/transfer" element={<TransferMoney />} /> {/* Customer transfers own money */}
                        <Route path="/check-balance" element={<CheckBalancePage />} /> {/* Customer checks own balance */}
                        <Route path="/history" element={<TransactionHistoryPage />} /> {/* Customer downloads own history */}
                        <Route path="/apply-loan" element={<ApplyLoanPage/>}/>
                        <Route path='/my-loans' element={<MyLoansPage/>}/>
                        <Route path='/apply-fd' element={<ApplyFDPage/>}/>
                        <Route path='/my-fds' element={<MyFdsPage/>}/>

                    </Route>

                    {/* --- Admin Routes --- */}
                    {/* Accessible ONLY by ADMIN */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/pending" element={<PendingApprovalsPage />} /> {/* Manage Customer Approvals */}
                        <Route path="/admin/applications" element={<AdminApplicationsListPage />} /> {/* List Job Apps */}
                        <Route path="/admin/applications/:appId" element={<AdminApplicationDetailPage />} /> {/* Detail Job App */}
                        <Route path="/admin/loan/pending" element={<PendingLoansPage />} /> 
                        <Route path="/admin/fd/pending" element={<PendingFdsPage />} />
                        {/* Admin access to Employee routes is granted by the next block */}
                    </Route>

                    {/* --- Employee Routes --- */}
                    {/* Accessible by EMPLOYEE and ADMIN */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_ADMIN']} />}>
                        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
                        <Route path="/employee/deposit" element={<EmployeeDepositPage />} /> {/* Deposit for customer */}
                        <Route path="/employee/withdraw" element={<EmployeeWithdrawalPage />} /> {/* Withdraw for customer */}
                        <Route path="/employee/check-balance" element={<EmployeeCheckBalancePage />} /> {/* Check any customer balance */}
                        {/* <Route path="/employee/download-history" element={<EmployeeDownloadHistoryPage />} /> Check any customer balance */}
                    </Route>

                    {/* --- Catch-all for 404 Not Found --- */}
                    {/* This should be the last route */}
                    <Route path="*" element={<NotFoundPage />} />

                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;