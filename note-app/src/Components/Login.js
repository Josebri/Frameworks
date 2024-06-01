import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/users/login', { username, password });
      onLoginSuccess(response.data.token);
      localStorage.setItem('token', response.data.token);
      navigate('/notes');
    } catch (error) {
      console.error('Invalid credentials', error);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="welcome-message">Bienvenido a Bibliosyc</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="password-container">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              onClick={() => setShowPassword(!showPassword)}
              className="eye-icon"
            />
          </div>
          <button type="submit">Login</button>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
      <div className="login-image"></div>
    </div>
  );
};

export default Login;
