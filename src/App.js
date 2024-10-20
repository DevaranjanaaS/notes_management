//frondend/src/App.js
import React, { useState, useEffect } from 'react';
import NotesManager from './NotesManager';
import Signup from './SignUp';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));  // Safely parse JSON
      } catch (error) {
        console.error("Error parsing savedUser from localStorage:", error);
        // If parsing fails, handle it (e.g., clear localStorage or set to default)
        localStorage.removeItem('user');  // Remove invalid data
      }
    }
  }, []);
  

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));  // Store as JSON string
  };
  

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      {user ? (
        <NotesManager user={user} handleLogout={handleLogout} />
      ) : (
        <Signup onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
