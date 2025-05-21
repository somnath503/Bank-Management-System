import React, { useState } from 'react';
import axios from 'axios';
import '../cssfiles/Deposit.css';

const Withdraw = () => {
  const [mobileNo, setMobileNo] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();

    const withdrawData = { mobileNo, accountNo, amount: parseFloat(amount), password };

    try {
      const response = await axios.post('http://localhost:8080/withdrawal', withdrawData);
      setMessage(response.data); // Display success or error message from backend
    } catch (error) {
      console.error('Error withdrawing money:', error);
      setMessage('Error occurred while withdrawing money');
    }
  };

  return (
    <div>
      <h2>Withdraw Money</h2>
      <form onSubmit={handleWithdraw}>
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Withdraw</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Withdraw;
