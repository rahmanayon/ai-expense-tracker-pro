const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const sequelize = isTest
    ? new Sequelize('sqlite::memory:', { logging: false })
    : new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
        }
    });

const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Tenant = require('./Tenant')(sequelize);

// Basic Category model since it was referenced but not found
const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emoji: {
        type: DataTypes.STRING
    },
    // userId will be added by association
});

// Associations
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Transaction, { foreignKey: 'categoryId' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = {
    sequelize,
    User,
    Transaction,
    Tenant,
    Category
};
