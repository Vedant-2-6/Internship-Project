import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, signup } from '../services/authService';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const { token } = await login({ username, password });
        authLogin(token);
        localStorage.setItem('username', username); 
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const { token } = await signup({ username, password });
        authLogin(token);
        localStorage.setItem('username', username); 
      }
      navigate('/dashboard');
    } catch {
      setError(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2 className="auth-form-header">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>

        {error && (
          <div className="auth-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          <div>
            <label className="auth-form-label">Username</label>
            <input
              type="text"
              className="auth-form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="auth-form-label">Password</label>
            <input
              type="password"
              className="auth-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="auth-form-label">Confirm Password</label>
              <input
                type="password"
                className="auth-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-form-submit"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>
        <div className="auth-form-toggle">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <span className="auth-form-link" onClick={() => setIsLogin(false)}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span className="auth-form-link" onClick={() => setIsLogin(true)}>Login</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
