import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ search, onSearchChange }: { search: string, onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const { isAuthenticated, logout } = useAuth();
  const username = localStorage.getItem('username') || 'Profile';

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
        <span>Notes</span>
      </div>
      <input
        type="text"
        placeholder="Search notes..."
        className="navbar-search"
        value={search}
        onChange={onSearchChange}
      />
      {isAuthenticated && (
        <div className="navbar-profile">
          {username}
        </div>
      )}
      <button className="navbar-button">Toggle Theme</button>
      {isAuthenticated && (
        <button
          className="navbar-logout-button"
          onClick={logout}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;