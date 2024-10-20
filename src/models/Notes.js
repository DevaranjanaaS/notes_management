//backend/models.Notes.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userEmail: String,
  timestamp: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Note', noteSchema);
