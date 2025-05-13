const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
const collaboratorController = require('../controllers/collaboratorController');

// Protect all notes routes
router.use(authMiddleware);

// Create a new note
router.post('/', noteController.createNote);

// Get all notes for the logged-in user
router.get('/', noteController.getNotes);

//:id/archived
router.get('/archived', noteController.getArchivedNotes);
// Get a single note by ID
router.get('/:id', noteController.getNoteById);

// Update a note by ID
router.put('/:id', noteController.updateNote);

// Delete a note by ID
router.delete('/:id', noteController.deleteNote);

// Pin/unpin a note
router.patch('/:id/pin', noteController.togglePin);

// Archive/unarchive a note
router.patch('/:id/archive', noteController.toggleArchive);

// Set color
router.patch('/:id/color', noteController.setColor);

// Set reminder
router.patch('/:id/reminder', noteController.setReminder);

router.patch('/:id', noteController.updateNoteFields);

// Add collaborator to note
router.post('/:id/collaborators', noteController.addCollaborator);

// Get collaborators for a note
router.get('/:id/collaborators', noteController.getCollaborators);

// Remove a collaborator
router.delete('/:noteId/collaborators/:userId', collaboratorController.removeCollaborator);

// Get notes shared with the logged-in user
router.get('/notes', collaboratorController.getNotesSharedWithMe);

// Update collaborator permission
router.patch('/:noteId/collaborators/:userId', collaboratorController.updatePermission);

module.exports = router;