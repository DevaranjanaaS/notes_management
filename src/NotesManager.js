import React, { useState, useEffect } from 'react';
import './NotesManager.css';
import Modal from 'react-modal';
import { FaPencilAlt, FaTrash, FaPlus, FaSyncAlt, FaDownload, FaCloudDownloadAlt } from 'react-icons/fa';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

Modal.setAppElement('#root');

function NotesManager({ user, handleLogout }) {
  const [notes, setNotes] = useState([]);
  const [offlineNotes, setOfflineNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // New state to hold combined notes
  const [newNote, setNewNote] = useState({ title: '', content: '', timestamp: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [noNotes, setNoNotes] = useState(false); // State for displaying the message

  useEffect(() => {
    const savedOfflineNotes = JSON.parse(localStorage.getItem(`notes_${user.email}`)) || [];
    setOfflineNotes(savedOfflineNotes);

    // Fetch notes from the database
    fetch(`/api/notes?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        const dbNotes = data.notes || [];
        setNotes(dbNotes);
        setLastSyncTime(new Date());

        // Combine database notes with offline notes
        const allNotes = [...dbNotes, ...savedOfflineNotes];
        setAllNotes(allNotes);
        setNoNotes(allNotes.length === 0);
      });
  }, [user]);

  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (num) => (num < 10 ? '0' + num : num);
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
  const handleCreateNote = () => {
      const timestamp = getFormattedTimestamp();
  
      if (editingNote !== null) {
        const updatedNotes = offlineNotes.map((note, index) =>
          index === editingNote ? { ...newNote, timestamp } : note
        );
        setOfflineNotes(updatedNotes);
        localStorage.setItem(`notes_${user.email}`, JSON.stringify(updatedNotes));
        setEditingNote(null);
      } else {
        const updatedNotes = [...offlineNotes, { ...newNote, timestamp }];
        setOfflineNotes(updatedNotes);
        localStorage.setItem(`notes_${user.email}`, JSON.stringify(updatedNotes));
      }
      setNewNote({ title: '', content: '' });
      setModalIsOpen(false);
  };
  
  const handleDeleteNote = (index) => {
    const updatedNotes = offlineNotes.filter((_, i) => i !== index);
    setOfflineNotes(updatedNotes);
    localStorage.setItem(`notes_${user.email}`, JSON.stringify(updatedNotes));
  };

  const handleEditNote = (index) => {
    setEditingNote(index);
    setNewNote(offlineNotes[index]);
    setModalIsOpen(true);
  };

  const handleViewNote = (note) => {
    setViewingNote(note);
    setViewModalIsOpen(true);
  };

  const handleSyncNotes = async () => {
    const notesToSync = offlineNotes.filter(note => {
      const noteDate = new Date(note.timestamp);
      return !lastSyncTime || noteDate > lastSyncTime;
    });
  
    if (notesToSync.length === 0) {
      alert('No new or updated notes to sync.');
      return;
    }
  
    const response = await fetch('/api/sync-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: notesToSync, email: user.email }),
    });
  
    if (response.ok) {
      setLastSyncTime(new Date());
      alert('Notes synced successfully!');
    } else {
      alert('Sync failed');
    }
  };
  
  const handleDownloadNote = (note) => {
    const blob = new Blob([note.content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    allNotes.forEach(note => {
      zip.file(`${note.title}.txt`, note.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'notes.zip');
  };

  return (
    <div className="container">
      <h1>Welcome {user.name}</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <div className="notes-section">
        {noNotes ? (
          <div className="no-docs-msg">No documents created. Create one!</div>
        ) : (
          <div className="offline-notes">
            {allNotes.map((note, index) => (
              <div key={index} className="note" onClick={() => handleViewNote(note)}>
                <div className="note-title">{note.title}</div>
                <div className="note-actions">
                  <button onClick={() => handleEditNote(index)} className="edit-btn">
                    <FaPencilAlt />
                  </button>
                  <button onClick={() => handleDeleteNote(index)} className="delete-btn">
                    <FaTrash />
                  </button>
                  <button onClick={() => handleDownloadNote(note)} className="download-btn">
                    <FaDownload />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setModalIsOpen(true)} className="add-btn"><FaPlus /> Add Note</button>
      <button onClick={handleSyncNotes} className="sync-btn"><FaSyncAlt /> Sync Notes</button>
      <button onClick={handleDownloadAll} className="download-all-btn"><FaCloudDownloadAlt /> Download All</button>

      {/* Modal for creating/editing notes */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} contentLabel="Note Modal">
        <h2>{editingNote !== null ? 'Edit Note' : 'Create Note'}</h2>
        <input
          type="text"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          placeholder="Content"
        />
        <button onClick={handleCreateNote}>Save</button>
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </Modal>

      {/* Modal for viewing notes */}
      <Modal isOpen={viewModalIsOpen} onRequestClose={() => setViewModalIsOpen(false)} contentLabel="View Note">
        <h2>{viewingNote && viewingNote.title}</h2>
        <p>{viewingNote && viewingNote.content}</p>
        <button onClick={() => setViewModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default NotesManager;
