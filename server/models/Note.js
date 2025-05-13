const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#ffffff',
  },
  reminder: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

// Each note belongs to a user
Note.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Note, { foreignKey: 'userId' });

Note.associate = function(models) {
  Note.belongsToMany(models.User, {
    through: 'Collaborators',
    as: 'collaborators',
    foreignKey: 'noteId'
  });
};

module.exports = Note;