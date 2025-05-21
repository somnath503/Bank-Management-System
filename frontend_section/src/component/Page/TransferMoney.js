// src/component/Page/SimplifiedTransferPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

const SimplifiedTransferPage = () => {
  const { authState } = useAuth();

  const [balance, setBalance] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    // senderPassword: '', // REMOVED senderPassword from state
    receiverCustomerId: '',
    receiverMobileNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  useEffect(() => {
    if (!authState.isLoggedIn) return;

    const fetchBalance = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/check-balance`, {
          withCredentials: true
        });
        if (res.data.success && res.data.balance !== undefined) {
          setBalance(parseFloat(res.data.balance));
        } else {
          throw new Error(res.data.message || 'Balance fetch failed');
        }
      } catch (err) {
        setMessage('Error fetching balance');
        setSeverity('error');
      }
    };

    fetchBalance();
  }, [authState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // REMOVED senderPassword from destructuring
    const { amount, receiverCustomerId, receiverMobileNo } = formData;

    if (!amount || !receiverCustomerId || !receiverMobileNo) {
      setMessage('Please fill in all fields.');
      setSeverity('warning');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage('Amount must be greater than zero.');
      setSeverity('warning');
      return;
    }

    if (balance !== null && parseFloat(amount) > balance) {
      setMessage('Insufficient balance.');
      setSeverity('warning');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/transfer`, {
        amount: amount,
        receiverCustomerId: receiverCustomerId,
        receiverMobileNo // senderPassword is not sent here
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        setMessage('Transfer successful.');
        setSeverity('success');
        setFormData({
          amount: '',
          // senderPassword: '', // REMOVED clearing senderPassword
          receiverCustomerId: '',
          receiverMobileNo: ''
        });

        // Refresh balance
        const balanceRes = await axios.get(`${API_BASE_URL}/check-balance`, {
          withCredentials: true
        });
        if (balanceRes.data.success) {
          setBalance(parseFloat(balanceRes.data.balance));
        }
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Transfer failed');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  if (!authState.isLoggedIn) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Alert severity="warning">Please log in to access this page.</Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
         <Typography variant="h5" gutterBottom textAlign={'center'} width='100%'>Transfer Money</Typography>

        <Typography variant="body1">
          Balance: {balance !== null ? `₹${balance.toFixed(2)}` : <CircularProgress size={18} />}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          {/* senderPassword TextField has been completely removed */}
          <TextField
            label="Receiver Customer ID"
            name="receiverCustomerId"
            value={formData.receiverCustomerId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Receiver Mobile No"
            name="receiverMobileNo"
            value={formData.receiverMobileNo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          {message && (
            <Alert severity={severity} sx={{ mt: 2 }}>{message}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SimplifiedTransferPage;