import React, { useState, useEffect } from 'react';
import './NoteCard.css';
import { createPortal } from 'react-dom';

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

  useEffect(() => {
    const savedColor = localStorage.getItem(`note-color-${note.id}`);
    if (savedColor) {
      setColor(savedColor);
    }
  }, [note.id]);

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

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(note.id, title, content);
      setIsEditing(false);
    } else {
      console.error('Update function not provided');
    }
  };

  const [collaborators, setCollaborators] = useState('');
  const [permission, setPermission] = useState('read-only');

  const handleShare = () => {
    setIsFlipped(false);
  };

  const handleEditClick = () => {
    setShowPopup(true);
  };

  const handlePopupSave = () => {
    if (isNew && onSave) onSave(title, content);
    else if (onUpdate) onUpdate(note.id, title, content);
    setShowPopup(false);
    setIsEditing(false);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
    setIsEditing(false);
    setTitle(note.title || '');
    setContent(note.content || '');
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

    </div>
  );
};

export default NoteCard;
