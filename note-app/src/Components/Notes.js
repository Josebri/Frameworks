import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notes.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', color: '#000000', fontSize: 14, fontFamily: 'Arial' });
  const [editing, setEditing] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', color: '#000000' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes', error);
      setErrorMessage('Error fetching notes');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length <= 35) {
      setCurrentNote({
        ...currentNote,
        [name]: value
      });
    } else if (name === 'content' && value.length <= 500) {
      setCurrentNote({
        ...currentNote,
        [name]: value
      });
    }
  };

  const handleCreateNote = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/notes', currentNote, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentNote({ title: '', content: '', color: '#000000', fontSize: 14, fontFamily: 'Arial' });
      fetchNotes();
      showSuccessMessage('Note created successfully');
    } catch (error) {
      console.error('Error creating note', error);
      setErrorMessage('Error creating note');
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setEditing(true);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/notes/${currentNote.id}`, currentNote, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentNote({ title: '', content: '', color: '#000000', fontSize: 14, fontFamily: 'Arial' });
      setEditing(false);
      fetchNotes();
      showSuccessMessage('Note updated successfully');
    } catch (error) {
      console.error('Error updating note', error);
      setErrorMessage('Error updating note');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
      showSuccessMessage('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note', error);
      setErrorMessage('Error deleting note');
    }
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    setCurrentNote({
      ...currentNote,
      fontSize: e.target.value
    });
  };

  const handleFontColorChange = (e) => {
    setFontColor(e.target.value);
    setCurrentNote({
      ...currentNote,
      color: e.target.value
    });
  };

  const handleFontFamilyChange = (e) => {
    setFontFamily(e.target.value);
    setCurrentNote({
      ...currentNote,
      fontFamily: e.target.value
    });
  };

  const handleClearNote = () => {
    setCurrentNote({ title: '', content: '', color: '#000000', fontSize: 14, fontFamily: 'Arial' });
    setEditing(false);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const openModal = (note) => {
    setModalContent(note);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalContent({ title: '', content: '', color: '#000000' });
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="toolbar">
          <select value={fontSize} onChange={handleFontSizeChange}>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <input type="color" value={fontColor} onChange={handleFontColorChange} />
          <select value={fontFamily} onChange={handleFontFamilyChange}>
            {['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino'].map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="notes-content">
        <div className="note-editor">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={currentNote.title}
            onChange={handleNoteChange}
            style={{ fontSize: `${fontSize}px`, color: fontColor, fontFamily: fontFamily }}
          />
          <textarea
            name="content"
            placeholder="Content"
            value={currentNote.content}
            onChange={handleNoteChange}
            style={{ fontSize: `${fontSize}px`, color: fontColor, fontFamily: fontFamily }}
          ></textarea>
          {!editing ? (
            <button onClick={handleCreateNote}>Create Note</button>
          ) : (
            <button onClick={handleSaveChanges}><FontAwesomeIcon icon={faSave} /> Save Changes</button>
          )}
        </div>
        <div className="note-list">
          <h3>My Notes</h3>
          <ul>
            {notes.map(note => (
              <li key={note.id} style={{ backgroundColor: '#FFFFFF' }}>
                <div>
                  <h4 
                    onClick={() => openModal(note)}
                    style={{ color: note.color }}
                  >
                    {note.title}
                  </h4>
                </div>
                <div>
                  <button onClick={() => handleEditNote(note)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => handleDeleteNote(note.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="notes-footer">
        <button onClick={handleClearNote}>Clear Note</button>
      </div>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Note Content"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 style={{ color: modalContent.color }}>{modalContent.title}</h2>
        <p style={{ color: modalContent.color }}>{modalContent.content}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Notes;
