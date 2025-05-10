const express = require('express');
const router = express.Router();
const collaboratorController = require('../controllers/collaboratorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', collaboratorController.addCollaborators);
router.get('/:noteId', collaboratorController.getNoteCollaborators);
router.delete('/:noteId/:userId', collaboratorController.removeCollaborator);

module.exports = router;