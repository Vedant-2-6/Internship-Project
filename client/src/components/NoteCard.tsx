import React, { useState, useEffect } from 'react';
import './NoteCard.css';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NoteCard = ({
  note,
  isNew = false,
  onSave,
  onCancel,
  onUpdate, 
  onDelete,
  onPin,
  onArchive,
  onUnarchive,
  onColorChange,
  onReminderSet,
  showArchiveButton = true,
  showUnarchiveButton = false,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [color, setColor] = useState(note.color || '#232323');
  const [reminder, setReminder] = useState(note.reminder || '');
  const [isEditing, setIsEditing] = useState(isNew ? true : false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSharedUsers, setShowSharedUsers] = useState(false);
  // Update the type definition to include userId
  const [sharedUsers, setSharedUsers] = useState<{name: string, userId: number, permission: 'read-only' | 'full-access'}[]>([]);
  const { token } = useAuth();
  
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/notes/${note.id}/collaborators`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSharedUsers(response.data.map((collab: any) => ({
          name: collab.User ? collab.User.username : '',
          userId: collab.userId,
          permission: collab.permissionLevel === 'edit' ? 'full-access' : 'read-only'
        })));
      } catch (error) {
        console.error('Failed to fetch collaborators', error);
      }
    };
    if (note.id && token) fetchCollaborators();
  }, [note.id, token]);
  useEffect(() => {
    const savedColor = localStorage.getItem(`note-color-${note.id}`);
    if (savedColor) {
      setColor(savedColor);
    }
  }, [note.id]); // Add this useEffect for color initialization
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    localStorage.setItem(`note-color-${note.id}`, newColor);
    if (onColorChange) onColorChange(note.id, newColor);
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminder(e.target.value);
    if (onReminderSet) onReminderSet(note.id, e.target.value);
  };

  const handleSave = () => {
    if (onSave) onSave(title, content);
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    if (onUpdate) {
      onUpdate(note.id, title, content);
      setIsEditing(false);
    } else {
      // Directly update the note in the backend if onUpdate is not provided
      try {
        await axios.patch(
          `http://localhost:5000/api/notes/${note.id}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update note', error);
        alert('Failed to update note. Please try again.');
      }
    }
  };

  const [collaborators, setCollaborators] = useState('');
  const [permission, setPermission] = useState('read-only');

  const handleShare = async () => {
    try {
      const usernames = collaborators.split(',').map(u => u.trim()).filter(u => u);
      await axios.post(
        `http://localhost:5000/api/collaborators/${note.id}/collaborators`,
        { 
          usernames,
          permission 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      // Fetch updated collaborators from backend to get correct userId
      const response = await axios.get(
        `http://localhost:5000/api/notes/${note.id}/collaborators`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharedUsers(response.data.map((collab: any) => ({
        name: collab.User ? collab.User.username : '',
        userId: collab.userId,
        permission: collab.permissionLevel === 'edit' ? 'full-access' : 'read-only'
      })));
      setCollaborators('');
      setIsFlipped(false);
    } catch (error) {
      console.error('Error sharing note:', error);
      alert('Failed to share note. Please try again.');
    }
  };

  const handleEditClick = () => {
    setShowPopup(true);
  };

  const handlePopupSave = async () => {
    if (isNew && onSave) {
      onSave(title, content);
    } else {
      await handleUpdate();
    }
    setShowPopup(false);
    setIsEditing(false);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
    setIsEditing(false);
    setTitle(note.title || '');
    setContent(note.content || '');
  };

  const handleRemoveCollaborator = async (userId: number) => {
    try {
      console.log('Removing collaborator:', note.id, userId); // Add this line
      await axios.delete(
        `http://localhost:5000/api/notes/${note.id}/collaborators/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharedUsers(sharedUsers.filter(user => user.userId !== userId));
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert('Failed to remove collaborator. Please try again.');
    }
  };

  const handlePermissionChange = async (userId: number, newPermission: 'read-only' | 'full-access') => {
    try {
      console.log('Changing permission:', note.id, userId, newPermission); // Add this line
      await axios.patch(
        `http://localhost:5000/api/notes/${note.id}/collaborators/${userId}`,
        { permission: newPermission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSharedUsers(sharedUsers.map(user => 
        user.userId === userId 
          ? { ...user, permission: newPermission } 
          : user
      ));
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission. Please try again.');
    }
  };

  return (
    <div className="note-card">
      <div className={`card-inner${isFlipped ? ' flipped' : ''}`}>
        {/* Front Side */}
        <div className="note-card-front" style={{ background: color }}>
          <div className="note-card-header">
            <span className="note-card-date">
              {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
            </span>
            <span className="note-card-pin" onClick={() => onPin && onPin(note.id)} title="Pin">
              {note.pinned ? '📌' : '📍'}
            </span>
          </div>
          <div className="note-card-title" onClick={handleEditClick}>{title}</div>
          <div className="note-card-body" onClick={handleEditClick}>{content}</div>
          <div className="note-card-actions-bottom">
            <button
              className="note-card-button"
              title="Color"
              onClick={() => document.getElementById(`color-input-${note.id}`)?.click()}
              type="button"
            >
              🎨
              <input
                id={`color-input-${note.id}`}
                type="color"
                value={color}
                onChange={handleColorChange}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                  position: 'absolute',
                  pointerEvents: 'none'
                }}
                tabIndex={-1}
              />
            </button>
            {showArchiveButton && (
              <button className="note-card-button" title="Archive" onClick={() => onArchive && onArchive(note.id)}>
                🗄
              </button>
            )}
            {showUnarchiveButton && (
              <button className="note-card-button" title="Unarchive" onClick={() => onUnarchive && onUnarchive(note.id)}>
                📤
              </button>
            )}
            <button className="note-card-button" title="Collaborators" onClick={() => setIsFlipped(true)}>
              👥
            </button>
            <button
              className="note-card-button"
              title="Reminder"
              onClick={() => document.getElementById(`reminder-input-${note.id}`)?.click()}
              type="button"
            >
              ⏰
              <input
                id={`reminder-input-${note.id}`}
                type="datetime-local"
                value={reminder}
                onChange={handleReminderChange}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                  position: 'absolute',
                  pointerEvents: 'none'
                }}
                tabIndex={-1}
              />
            </button>
            <button
              className="note-card-button"
              title="Delete"
              onClick={() => {
                if (onDelete) {
                  onDelete(note.id);
                } else {
                  console.error('Delete function not provided');
                }
              }}
            >
              🗑
            </button>
          </div>
        </div>
        {/* Back Side */}
        <div className="note-card-back" style={{ background: color }}>
          <div className="collab-title">Add Collaborators</div>
          <input
            type="text"
            className="collab-input"
            placeholder="Enter usernames (comma separated)"
            value={collaborators}
            onChange={(e) => setCollaborators(e.target.value)}
          />
          <select 
            className="collab-select"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="read-only">Read Only</option>
            <option value="full-access">Full Access</option>
          </select>
          <div className="collab-actions">
            <button
              className="note-card-button"
              title="Show Shared Users"
              onClick={() => setShowSharedUsers(true)}
            >
              ⭐
            </button>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <button className="note-card-button" onClick={() => { handleShare(); setIsFlipped(false); }}>Share</button>
            <button className="note-card-button" onClick={() => setIsFlipped(false)}>Cancel</button>
          </div>
        </div>
      </div>
      {showPopup && createPortal(
  <div className="note-popup-overlay">
    <div className="note-popup">
      <input
        type="text"
        className="note-popup-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title..."
      />
      <textarea
        className="note-popup-content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Content..."
      />
      <div className="note-popup-actions">
        <button className="note-popup-btn" onClick={handlePopupSave}>Save</button>
        <button className="note-popup-btn" onClick={handlePopupCancel}>Cancel</button>
      </div>
    </div>
  </div>,
  document.body
)}

        {showSharedUsers && (
          <div className="shared-users-popup">
            <div className="shared-users-header">
              <span>Shared With</span>
              <button className="close-btn" onClick={() => setShowSharedUsers(false)}>×</button>
            </div>
            <ul className="shared-users-list">
              {sharedUsers.map((user, idx) => (
                <li key={user.userId || user.name}>
                  <span className="shared-username" title={user.name || "Unknown User"}>
                    {user.name && user.name.trim() !== "" ? user.name : "Unknown User"}
                  </span>
                  <span
                    className="shared-permission"
                    title={user.permission === 'full-access' ? 'Full Access' : 'Read Only'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handlePermissionChange(
                        user.userId, 
                        user.permission === 'full-access' ? 'read-only' : 'full-access'
                      );
                    }}
                  >
                    {user.permission === 'full-access' ? '🔓' : '🔒'}
                  </span>
                  <button
                    className="remove-user-btn"
                    title="Remove user"
                    onClick={() => handleRemoveCollaborator(user.userId)}
                  >×</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      {/* </div> */}
      {showPopup && createPortal(
  <div className="note-popup-overlay">
    <div className="note-popup">
      <input
        type="text"
        className="note-popup-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title..."
      />
      <textarea
        className="note-popup-content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Content..."
      />
      <div className="note-popup-actions">
        <button className="note-popup-btn" onClick={handlePopupSave}>Save</button>
        <button className="note-popup-btn" onClick={handlePopupCancel}>Cancel</button>
      </div>
    </div>
  </div>,
  document.body
)}

    </div>
  );
};

export default NoteCard;
