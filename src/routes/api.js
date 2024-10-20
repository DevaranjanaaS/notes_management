const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Notes');

// Handle user login/signup
router.post('/login', async (req, res) => {
  console.log(req.body); // Debugging line - check what data is received
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and Email are required' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email });
      await user.save();
      console.log('New user saved to DB'); // Debugging line
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Fetch notes
router.get('/notes', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const notes = await Note.find({ userEmail: email });

    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Sync notes
router.post('/sync-notes', async (req, res) => {
  try {
    const { notes, email } = req.body;

    if (!email || !notes || !notes.length) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Fetch existing notes from the database
    const existingNotes = await Note.find({ userEmail: email });

    // Create a map to easily check for existing notes by title or timestamp
    const existingNotesMap = new Map();
    existingNotes.forEach(note => {
      existingNotesMap.set(note.title, note);
    });

    // Merge notes: add new notes from frontend and update existing notes
    for (const note of notes) {
      if (!existingNotesMap.has(note.title)) {
        // If the note doesn't exist, insert it
        await Note.create({
          title: note.title,
          content: note.content,
          userEmail: email,
          timestamp: note.timestamp 
            ? formatTimestamp(new Date(note.timestamp)) 
            : formatTimestamp(new Date()), // Use existing timestamp or set current time
        });
      } else {
        // If the note exists, update it
        await Note.updateOne(
          { title: note.title, userEmail: email }, 
          { content: note.content, timestamp: formatTimestamp(new Date()) }
        );
      }
    }

    // Respond with success
    res.sendStatus(200);
  } catch (error) {
    console.error('Error syncing notes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Function to format date as YYYY-MM-DD HH:MM:SS
const formatTimestamp = (date) => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};



module.exports = router;
