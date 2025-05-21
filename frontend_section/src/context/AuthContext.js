// --- src/context/AuthContext.js ---
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isLoggedIn: !!localStorage.getItem('isLoggedIn'),
        userRole: localStorage.getItem('userRole') || null,
        customerId: localStorage.getItem('customerId') || null,
    });

    const login = (role, customerId) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('customerId', customerId);

        setAuthState({
            isLoggedIn: true,
            userRole: role,
            customerId: customerId,
        });
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('customerId');

        setAuthState({
            isLoggedIn: false,
            userRole: null,
            customerId: null,
        });
    };

    useEffect(() => {
        const handleStorageChange = () => {
            setAuthState({
                isLoggedIn: !!localStorage.getItem('isLoggedIn'),
                userRole: localStorage.getItem('userRole') || null,
                customerId: localStorage.getItem('customerId') || null,
            });
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
