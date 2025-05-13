import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className={`sidebar ${isOpen ? '' : 'sidebar-collapsed'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`sidebar-hamburger ${isOpen ? 'open' : ''}`}
        aria-label="Toggle sidebar"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      {isOpen && (
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/dashboard')}>Home</li>
          {/* <li className="sidebar-menu-item">Recycle Bin</li> */}
          <li className="sidebar-menu-item" onClick={() => navigate('/archived')}>Archived</li>
          <li className="sidebar-menu-item">Reminders</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/shared-notes')}>Shared Notes</li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;