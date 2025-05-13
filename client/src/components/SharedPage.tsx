import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NoteCard from './NoteCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './SharedPage.css';

const SharedPage = () => {
  const [search, setSearch] = useState('');
  const [sharedNotes, setSharedNotes] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/collaborators/notes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSharedNotes(response.data);
      } catch (error) {
        console.error('Error fetching shared notes:', error);
      }
    };
    if (token) fetchSharedNotes();
  }, [token]);

  // Filter notes based on search query
  const filterNotes = (notesArr: any[]) => {
    if (!search.trim()) return notesArr;
    return notesArr.filter(
      (note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredNotes = filterNotes(sharedNotes);

  return (
    <div className="shared-container">
      <Sidebar />
      <div className="shared-main">
        <Navbar 
          search={search} 
          onSearchChange={(e) => setSearch(e.target.value)} 
        />
        <div className="shared-notes-container">
          <div className="notes-grid">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note: any) => (
                <NoteCard 
                  key={note.id} 
                  note={note}
                  showArchiveButton={false}
                  showUnarchiveButton={false}
                />
              ))
            ) : (
              <div className="no-notes-message">
                No shared notes found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPage;