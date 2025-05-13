const User = require('./User');
const Note = require('./Note');
const Collaborator = require('./Collaborator');
const db = { User, Note, Collaborator };

// Add this loop:
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
module.exports = {
  User,
  Note, 
  Collaborator,
  db
};