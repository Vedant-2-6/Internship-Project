const { Collaborator, User, Note } = require('./../models');

// Add collaborators to a note
exports.addCollaborators = async (req, res) => {
  const { noteId } = req.params;
  let { usernames, permission } = req.body;
  
  try {
    // Convert comma-separated usernames to array
    if (typeof usernames === 'string') {
      usernames = usernames.split(',').map(u => u.trim()).filter(Boolean);
    }

    // Map frontend permission to backend
    let permissionLevel = 'view';
    if (permission === 'full-access') permissionLevel = 'edit';
    else if (permission === 'read-only') permissionLevel = 'view';

    const users = await User.findAll({ where: { username: usernames } });

    if (users.length !== usernames.length) {
      const foundUsernames = users.map(u => u.username);
      const missing = usernames.filter(u => !foundUsernames.includes(u));
      return res.status(404).json({ error: `Users not found: ${missing.join(', ')}` });
    }
    
    const collabs = await Promise.all(users.map(async user => {
      // Check if collaborator already exists
      let collab = await Collaborator.findOne({ where: { noteId, userId: user.id } });
      if (collab) {
        // Optionally update permission if needed
        await collab.update({ permissionLevel });
        return collab;
      } else {
        // Create new collaborator
        return Collaborator.create({ noteId, userId: user.id, permissionLevel });
      }
    }));

    res.status(201).json(collabs.map(c => ({
      userId: c.userId,
      permission: permission,
      name: users.find(u => u.id === c.userId)?.username || ''
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCollaborators = async (req, res) => {
  const { noteId } = req.params;
  try {
    const collabs = await Collaborator.findAll({
      where: { noteId },
      include: [{
        model: User,
        attributes: ['id', 'username'],
        required: true
      }]
    });
    
    res.status(200).json(collabs.map(c => ({
      userId: c.User ? c.User.id : null,
      name: c.User ? c.User.username : '',
      permission: c.permissionLevel === 'edit' ? 'full-access' : 'read-only'
    })));
  } catch (err) {
    console.error('Error fetching collaborators:', err);
    res.status(500).json({ 
      error: 'Failed to fetch collaborators',
      details: err.message 
    });
  }
};

// Remove collaborator from a note
exports.removeCollaborator = async (req, res) => {
  const { noteId, userId } = req.params;
  try {
    const collab = await Collaborator.findOne({
      where: { noteId, userId }
    });
    if (collab) {
      await collab.destroy();
      res.status(200).json({ message: 'Collaborator removed' });
    } else {
      res.status(404).json({ error: 'Collaborator not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePermission = async (req, res) => {
  const { noteId, userId } = req.params;
  const { permission } = req.body;
  try {
    const collab = await Collaborator.findOne({
      where: { noteId, userId }
    });
    if (collab) {
      // Map frontend permission to backend
      let permissionLevel = 'view';
      if (permission === 'full-access') permissionLevel = 'edit';
      else if (permission === 'read-only') permissionLevel = 'view';
      await collab.update({ permissionLevel });
      res.status(200).json({ message: 'Permission updated' });
    } else {
      res.status(404).json({ error: 'Collaborator not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getNotesSharedWithMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Find all collaborator entries for this user
    const collaborations = await Collaborator.findAll({ where: { userId } });
    const noteIds = collaborations.map(c => c.noteId);

    // Find all notes where this user is a collaborator
    const notes = await Note.findAll({ where: { id: noteIds } });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Failed to fetch shared notes' });
  }
};
