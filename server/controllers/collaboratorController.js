const Collaborator = require('../models/Collaborator');
const Note = require('../models/Note');
const User = require('../models/User');

exports.addCollaborators = async (req, res) => {
    try {
        const { noteId, userIds, permissionLevel } = req.body;
        
        // Verify requesting user owns the note
        const note = await Note.findOne({ 
            where: { 
                id: noteId, 
                userId: req.user.userId 
            } 
        });
        if (!note) {
            return res.status(403).json({ message: 'You can only add collaborators to your own notes' });
        }

        // Check if all users exist
        const users = await User.findAll({
            where: {
                id: userIds
            }
        });
        if (users.length !== userIds.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }

        // Check for existing collaborations
        const existingCollaborations = await Collaborator.findAll({ 
            where: { 
                noteId, 
                userId: userIds 
            } 
        });
        if (existingCollaborations.length > 0) {
            return res.status(400).json({ 
                message: 'Some users are already collaborators',
                existingUsers: existingCollaborations.map(c => c.userId)
            });
        }

        // Create multiple collaborations
        const collaborators = await Collaborator.bulkCreate(
            userIds.map(userId => ({
                noteId,
                userId,
                permissionLevel: permissionLevel || 'view'
            }))
        );

        res.status(201).json(collaborators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeCollaborator = async (req, res) => {
    try {
        const { noteId, userId } = req.params;

        // Remove collaboration
        await Collaborator.findOneAndDelete({ note: noteId, user: userId });

        // Remove from note's collaborators array
        await Note.findByIdAndUpdate(noteId, {
            $pull: { collaborators: userId }
        });

        res.status(200).json({ message: 'Collaborator removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNoteCollaborators = async (req, res) => {
    try {
        const { noteId } = req.params;
        const collaborators = await Collaborator.find({ note: noteId }).populate('user', 'username email');
        res.status(200).json(collaborators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};