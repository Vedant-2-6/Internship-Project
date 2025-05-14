const Note = require('../models/Note');
const Collaborator = require('../models/Collaborator');
const User = require('../models/User');
exports.createNote = async (req, res) => {
  try {
    const { title, content, color, reminder } = req.body;
    const note = await Note.create({
      title,
      content,
      color: color || '#ffffff',
      reminder: reminder || null,
      userId: req.user.userId
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    // Only fetch notes that are not deleted and not archived, sort pinned first
    const notes = await Note.findAll({
      where: { userId: req.user.userId, deleted: false, archived: false },
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, color, reminder } = req.body;
    // Find the note by id only (not userId)
    const note = await Note.findOne({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user is owner
    if (note.userId !== req.user.userId) {
      // Not owner, check if collaborator with edit permission
      const collaborator = await Collaborator.findOne({
        where: { noteId: note.id, userId: req.user.userId, permissionLevel: 'edit' }
      });
      if (!collaborator) {
        return res.status(403).json({ message: 'You do not have permission to edit this note' });
      }
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (reminder !== undefined) note.reminder = reminder;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    await note.destroy();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};

// Pin/unpin note
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to pin/unpin note', error: error.message });
  }
};

// Archive/unarchive note
exports.toggleArchive = async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.archived = !note.archived;

    await note.save();

    res.json(note);
  } catch (error) {

    res.status(500).json({ message: 'Failed to archive/unarchive note', error: error.message });
  }
};

exports.getArchivedNotes = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized: User not found in request.' });
    }
    const notes = await Note.findAll({
      where: { userId: req.user.userId, archived: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(notes);
  } catch (error) {
    console.error("Error in getArchivedNotes:", error);
    res.status(500).json({ message: 'Failed to fetch archived notes', error: error.message });
  }
};

// Set color
exports.setColor = async (req, res) => {
  try {
    const { color } = req.body;
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.color = color;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to set color', error: error.message });
  }
};

// Set reminder
exports.setReminder = async (req, res) => {
  try {
    const { reminder } = req.body;
    const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.reminder = reminder;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to set reminder', error: error.message });
  }
};

// Generic PATCH handler to update any note fields
exports.updateNoteFields = async (req, res) => {
  try {
    // Find the note by id only (not userId)
    const note = await Note.findOne({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    // Check if user is owner
    if (note.userId !== req.user.userId) {
      // Not owner, check if collaborator with edit permission
      const collaborator = await Collaborator.findOne({
        where: { noteId: note.id, userId: req.user.userId, permissionLevel: 'edit' }
      });
      if (!collaborator) {
        return res.status(403).json({ message: 'You do not have permission to edit this note' });
      }
    }
    // Update only the fields provided in the request body
    Object.keys(req.body).forEach((key) => {
      note[key] = req.body[key];
    });
    await note.save();
    res.json(note);
    console.log("Note updated:", note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).send('Note not found');
    
    const collaborator = await Collaborator.create({
      noteId: req.params.id,
      userId: req.body.userId,
      permissionLevel: req.body.permissionLevel || 'view'
    });
    
    res.status(201).json(collaborator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCollaborators = async (req, res) => {
  try {
    const collaborators = await Collaborator.findAll({
      where: { noteId: req.params.id },
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};