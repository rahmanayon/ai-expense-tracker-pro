// backend/src/models/Tenant.js
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Tenant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    subdomain: { type: DataTypes.STRING, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
};