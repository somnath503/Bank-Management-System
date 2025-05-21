// --- src/utils/formatters.js ---
import React from 'react';
import Chip from '@mui/material/Chip';

/**
 * Formats a date string (or Date object) into a more readable date format.
 * Example: "Jan 1, 2023"
 * @param {string | Date} dateString - The date string or Date object to format.
 * @returns {string} Formatted date string or 'N/A' if invalid.
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date is valid after parsing
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date value');
        }
        return date.toLocaleDateString('en-IN', { // Use Indian English locale for DD/MM/YYYY or similar
            year: 'numeric',
            month: 'short', // 'Jan', 'Feb', etc.
            day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};

/**
 * Formats a date-time string (or Date object) into a more readable date and time format.
 * Example: "Jan 1, 2023, 10:30 AM"
 * @param {string | Date} dateTimeString - The date-time string or Date object to format.
 * @returns {string} Formatted date-time string or 'N/A' if invalid.
 */
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date-time value');
        }
        return date.toLocaleString('en-IN', { // Indian English locale
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // Use AM/PM
        });
    } catch (e) {
        console.error("Error formatting datetime:", dateTimeString, e);
        return 'Invalid DateTime';
    }
};

/**
 * Formats a number into a currency string (Indian Rupees).
 * Example: ₹ 1,000.00
 * @param {number | string} amount - The amount to format.
 * @returns {string} Formatted currency string or 'N/A' if invalid.
 */
export const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (amount === null || amount === undefined || isNaN(numAmount)) return 'N/A';
    try {
        return `₹ ${numAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    } catch (e) {
        console.error("Error formatting currency:", amount, e);
        return 'Invalid Amount';
    }
};

/**
 * Generates an MUI Chip component styled based on Fixed Deposit status.
 * @param {string} status - The status string (e.g., "PENDING", "ACTIVE").
 * @returns {JSX.Element} An MUI Chip component.
 */
export const getFdStatusChip = (status) => {
    let color = 'default';
    let label = status ? status.toUpperCase() : 'UNKNOWN'; // Ensure consistent casing for matching

    switch (label) {
        case 'PENDING': color = 'warning'; break;
        case 'ACTIVE': color = 'success'; break;
        case 'REJECTED': color = 'error'; break;
        case 'MATURED': color = 'info'; break;
        case 'CLOSED': color = 'default'; break; // You can use 'secondary' or 'grey' from MUI theme
        default: color = 'default';
    }
    return <Chip label={label} color={color} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontWeight: 500 }} />;
};

/**
 * Generates an MUI Chip component styled based on Loan Application status.
 * @param {string} status - The status string (e.g., "PENDING", "APPROVED").
 * @returns {JSX.Element} An MUI Chip component.
 */
export const getLoanStatusChip = (status) => {
    let color = 'default';
    let label = status ? status.toUpperCase().replace('_', ' ') : 'UNKNOWN'; // Handle potential underscores

    switch (status ? status.toUpperCase() : '') { // Match against uppercase status
        case 'PENDING': color = 'warning'; break;
        case 'UNDER_REVIEW': color = 'info'; break;
        case 'APPROVED': color = 'success'; break;
        case 'REJECTED': color = 'error'; break;
        case 'DISBURSED': color = 'primary'; break; // Or another distinct color
        case 'CLOSED': color = 'default'; break; // Or 'secondary'
        default: color = 'default';
    }
    return <Chip label={label} color={color} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontWeight: 500 }} />;
};