import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NoteCard from './NoteCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Archived = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchArchivedNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notes/archived', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
      } catch (error) {
        // Handle error
      }
    };
    if (token) fetchArchivedNotes();
  }, [token]);

  const handleUnarchive = async (noteId: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/notes/${noteId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the archived notes list
      const response = await axios.get('http://localhost:5000/api/notes/archived', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      // Handle error
    }
  };

  const handleUpdate = async (noteId: string, title: string, content: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notes/${noteId}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the archived notes list
      const response = await axios.get('http://localhost:5000/api/notes/archived', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      // Handle error
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter((note: any) => note.id !== noteId));
    } catch (error) {
      // Handle error
    }
  };

  const handlePin = async (noteId: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/notes/${noteId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the archived notes list
      const response = await axios.get('http://localhost:5000/api/notes/archived', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      // Handle error
    }
  };

  // Sort notes: pinned first, then by createdAt descending
  const sortedNotes = [...notes].sort((a: any, b: any) => {
    if (a.pinned === b.pinned) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.pinned - a.pinned;
  });

  // Filter notes based on search query
  const filterNotes = (notesArr: any[]) => {
    if (!search.trim()) return notesArr;
    return notesArr.filter(
      (note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredNotes = filterNotes(sortedNotes);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar search={search} onSearchChange={(e) => setSearch(e.target.value)} />
        <div className="note-cards-container">
          <div className="notes-grid">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note: any) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onUnarchive={() => handleUnarchive(note.id)} 
                  showUnarchiveButton={true} 
                  showArchiveButton={false}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onPin={handlePin}
                />
              ))
            ) : (
              <div style={{ color: '#bbb', textAlign: 'center', marginTop: '32px', fontSize: '1.2rem', width: '100%' }}>
                Cant Find Your Note here!! Sorry😢
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archived;