const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'notesdb',      // database name
  'notesuser',    // username
  'admin@123',    // password
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;