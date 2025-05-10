const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

User.associate = function(models) {
  User.belongsToMany(models.Note, {
    through: 'Collaborator',
    foreignKey: 'userId',
    as: 'sharedNotes'
  });
};

module.exports = User;