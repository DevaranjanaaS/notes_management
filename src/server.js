const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/note-management', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
