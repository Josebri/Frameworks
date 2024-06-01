import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password || !email) {
      setErrorMessage('All fields are required');
      return;
    }

    const specialCharPattern = /[?/><+=]/;
    if (specialCharPattern.test(password)) {
      setErrorMessage("can't have these special characters (? / > < + =)");
      return;
    }

    if (password.length < 8) {
      setErrorMessage('must be at least 8 characters');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com)$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Invalid email');
      return;
    }

    try {
      await axios.post('http://localhost:3000/users/register', { username, password, email });
      navigate('/login'); 
    } catch (error) {
      if (error.response && error.response.data === 'User already exists') {
        setErrorMessage('Existing user');
      } else {
        setErrorMessage('Error registering user');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="welcome-message">Bienvenido a Bibliosyc</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
          <button type="button" onClick={() => navigate('/login')}>Back to Login</button>
        </form>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
      <div className="register-image"></div>
    </div>
  );
};

export default Register;
