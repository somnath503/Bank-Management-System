import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Make sure to import useAuth

function Navbar() {
  const { authState, logout } = useAuth(); // Get auth state and logout function
  const navigate = useNavigate();

  const redirectToHome = () => {
    navigate("/"); // Correct navigate usage
  };

  return (
    <div>
      {/* Top Logo Section */}
      <div className="d-flex justify-content-center align-items-center py-2" style={{ backgroundColor: '#ffe600', position: 'fixed' }}>
        {/* Optional Logo or Title */}
      </div>

      {/* Bottom Navigation Section */}
      <nav className="navbar bg-black px-3" data-bs-theme="dark" style={{ position: 'sticky', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <div className="container-fluid">
          <div className="row w-100">
            {/* Home Button */}
            <div className="col text-center">
              <button onClick={redirectToHome} className="btn btn-outline-light w-100">Home</button>
            </div>

            {/* Conditional Links Based on Auth State */}
            {!authState.isLoggedIn && (
              <>
                <div className="col text-center">
                  <Link to="/login" className="btn btn-outline-light w-100">Customer Booth</Link>
                </div>
                <div className="col text-center">
                  <Link to="/employee" className="btn btn-outline-light w-100">Employee Booth</Link>
                </div>
                {/* <div className="col text-center">
                  <Link to="/admin" className="btn btn-outline-light w-100">Admin Booth</Link>
                </div> */}
              </>
            )}

            {/* Links for Logged-in Users */}
            {authState.isLoggedIn && authState.userRole === 'ROLE_USER' && (
              <div className="col text-center">
                <Link to="/header" className="btn btn-outline-light w-100">My Account</Link>
              </div>
            )}

            {authState.isLoggedIn && authState.userRole === 'ROLE_EMPLOYEE' && (
              <div className="col text-center">
                <Link to="/employee/dashboard" className="btn btn-outline-light w-100">Employee Portal</Link>
              </div>
            )}

            {authState.isLoggedIn && authState.userRole === 'ROLE_ADMIN' && (
              <div className="col text-center">
                <Link to="/admin/dashboard" className="btn btn-outline-light w-100">Admin Portal</Link>
              </div>
            )}

            {/* Logout Button */}
            {authState.isLoggedIn && (
              <div className="col text-center">
                <button onClick={logout} className="btn btn-outline-danger w-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
