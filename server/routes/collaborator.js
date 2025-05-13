const express = require('express');
const router = express.Router();
const collaboratorController = require('../controllers/collaboratorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Add collaborators to a note
router.post('/:noteId/collaborators', collaboratorController.addCollaborators);

// Get collaborators for a note
router.get('/:noteId/collaborators', collaboratorController.getCollaborators);

// Remove a collaborator
router.delete('/:noteId/collaborators/:userId', collaboratorController.removeCollaborator);

// Get notes shared with the logged-in user
router.get('/notes', collaboratorController.getNotesSharedWithMe);

// Update collaborator permission
router.patch('/:noteId/collaborators/:userId', collaboratorController.updatePermission);

module.exports = router;