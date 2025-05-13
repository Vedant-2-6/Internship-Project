const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminUserController = require('../controllers/adminUserController');

// Protect all routes with auth and admin check
router.use(authMiddleware, adminMiddleware);

// List all users
router.get('/', adminUserController.getAllUsers);

// Create a new user
router.post('/', adminUserController.createUser);

// Update a user
router.put('/:id', adminUserController.updateUser);

// Delete a user
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;