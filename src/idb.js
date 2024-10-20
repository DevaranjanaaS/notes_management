import { openDB } from 'idb';

// Create a database and store
const dbPromise = openDB('notesDB', 1, {
  upgrade(db) {
    db.createObjectStore('notes', {
      keyPath: 'id',
      autoIncrement: true,
    });
  },
});

// Function to add or update a note
export const addOrUpdateNote = async (note) => {
  const db = await dbPromise;
  await db.put('notes', note);
};

// Function to get all notes
export const getAllNotes = async () => {
  const db = await dbPromise;
  return await db.getAll('notes');
};

// Function to delete a note
export const deleteNote = async (id) => {
  const db = await dbPromise;
  await db.delete('notes', id);
};
