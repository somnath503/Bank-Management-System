// Deposit.js
import React, { useState } from 'react';
import axios from 'axios';
import '../cssfiles/Deposit.css'
const Deposit = () => {
  const [mobileNo, setMobileNo] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();

    const depositData = { mobileNo, accountNo, amount: parseFloat(amount) };

    try {
      const response = await axios.post('http://localhost:8080/deposit', depositData);
      setMessage(response.data); // Display success or error message from backend
    } catch (error) {
      console.error('Error depositing money:', error);
      setMessage('Error occurred while depositing money');
    }
  };

  return (
    <div>
      <h2>Deposit Money</h2>
      <form onSubmit={handleDeposit}>
        <input
          type="text"
          placeholder="Mobile Number"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Account Number"
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Deposit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Deposit;
