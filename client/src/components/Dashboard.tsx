// ... existing code ...
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NoteCard from './NoteCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [notes, setNotes] = useState<{ id: string; archived: boolean; [key: string]: any }[]>([]);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error); // Log error details
        alert('Failed to fetch notes. Please try again later.'); // Display user-friendly message
      }
    };
    fetchNotes();
  }, [token]);

  const handleAddNew = () => setAdding(true);

  const handleSaveNew = async (title: string, content: string) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/notes',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([response.data, ...notes]);
      setAdding(false);
    } catch (error) {
      console.error('Error saving note:', error); // Log error details
      alert('Failed to save the note. Please try again later.'); // Display user-friendly message
    }
  };

  // Redirect or show error if not authenticated
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#232323',
        color: '#fff'
      }}>
        <h2>You aren't logged in. Please login/register.</h2>
        <div style={{ marginTop: 24 }}>
          <button
            style={{
              marginRight: 16,
              padding: '10px 24px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onClick={() => navigate('/auth')}
          >
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  const pinnedNotes = notes.filter((note: any) => note.pinned && !note.archived && !note.deleted);
  const otherNotes = notes.filter((note: any) => !note.pinned && !note.archived && !note.deleted);

  // Filter notes based on search query
  const filterNotes = (notesArr: any[]) => {
    if (!search.trim()) return notesArr;
    return notesArr.filter(
      (note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredPinnedNotes = filterNotes(pinnedNotes);
  const filteredOtherNotes = filterNotes(otherNotes);
  const handleArchive = async (noteId: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/notes/${noteId}`,
        { archived: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((note: { id: string; archived: boolean }) =>
        note.id === noteId ? { ...note, archived: true } : note
      ));
      navigate('/archived'); // Add this line to redirect after archiving
    } catch (error) {
      console.error('Error archiving note:', error); // Log error details
      alert('Failed to archive the note. Please try again later.'); // Display user-friendly message
    }
  };
  const handleUpdate = async (noteId: string, title: string, content: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/notes/${noteId}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((note: any) =>
        note.id === noteId ? { ...note, title, content } : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update the note. Please try again later.');
    }
  };

  // Color change handler
  const handleColorChange = async (noteId: string, color: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/notes/${noteId}`,
        { color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((note: any) =>
        note.id === noteId ? { ...note, color } : note
      ));
    } catch (error) {
      console.error('Error changing note color:', error); // Log error details
      alert('Failed to change the note color. Please try again later.'); // Display user-friendly message
    }
  };

  // Delete handler
  const handleDelete = async (noteId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter((note: any) => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete the note. Please try again later.');
    }
  };
  const handlePin = async (noteId: string) => {
    try {
      // Find the note to get its current pinned state
      const note = notes.find((n: any) => n.id === noteId);
      if (!note) return;
      const newPinned = !note.pinned;
      const response = await axios.patch(
        `http://localhost:5000/api/notes/${noteId}`,
        { pinned: newPinned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((n: any) =>
        n.id === noteId ? { ...n, pinned: newPinned } : n
      ));
    } catch (error) {
      console.error('Error pinning/unpinning note:', error);
      alert('Failed to pin/unpin the note. Please try again later.');
    }
  };
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar search={search} onSearchChange={(e) => setSearch(e.target.value)} />
       
        <div className="note-cards-container">
          {adding && (
            <NoteCard
              note={{ title: '', content: '' }}
              isNew
              onSave={handleSaveNew}
              onCancel={() => setAdding(false)}
            />
          )}

          {filteredPinnedNotes.length > 0 && (
            <div className="notes-section">
              <div className="notes-section-title">Pinned Notes</div>
              <hr className="notes-section-divider" />
              <div className="notes-grid">
                {filteredPinnedNotes.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    onColorChange={handleColorChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {(filteredPinnedNotes.length > 0 && filteredOtherNotes.length > 0) && (
            <div className="notes-section">
              <div className="notes-section-title">Unpinned Notes</div>
              <hr className="notes-section-divider" />
              <div className="notes-grid">
                {filteredOtherNotes.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPin={handlePin}
                    onUpdate={handleUpdate}
                    onArchive={() => handleArchive(note.id)}
                    showArchiveButton={true}
                    showUnarchiveButton={false}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredPinnedNotes.length === 0 && filteredOtherNotes.length > 0 && (
            <div className="notes-section">
              <div className="notes-grid">
                {filteredOtherNotes.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPin={handlePin}
                    onUpdate={handleUpdate}
                    onArchive={() => handleArchive(note.id)}
                    showArchiveButton={true}
                    showUnarchiveButton={false}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredPinnedNotes.length === 0 && filteredOtherNotes.length === 0 && (
            <div style={{ color: '#bbb', textAlign: 'center', marginTop: '32px', fontSize: '1.2rem' }}>
              Cant Find Your Note here!! Sorry😢
            </div>
          )}
        </div>
        <button
          className="add-note-btn"
          onClick={handleAddNew}
          title="Add Note"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
