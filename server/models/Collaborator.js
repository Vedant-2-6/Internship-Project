const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Collaborator = sequelize.define('Collaborator', {
  permissionLevel: {
    type: DataTypes.ENUM('view', 'edit'),
    defaultValue: 'view'
  }
});
Collaborator.associate = function(models) {
    Collaborator.belongsTo(models.User, { foreignKey: 'userId' });
    Collaborator.belongsTo(models.Note, { foreignKey: 'noteId' });
  };

module.exports = Collaborator;