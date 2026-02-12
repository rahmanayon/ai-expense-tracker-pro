const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        },
        preferredCurrency: {
            type: DataTypes.STRING,
            defaultValue: 'USD'
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        lastLoginAt: {
            type: DataTypes.DATE
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        twoFactorSecret: {
            type: DataTypes.STRING
        },
        twoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        subscriptionPlan: {
            type: DataTypes.ENUM('free', 'premium', 'enterprise'),
            defaultValue: 'free'
        },
        subscriptionEndsAt: {
            type: DataTypes.DATE
        },
        resetPasswordToken: {
            type: DataTypes.STRING
        },
        resetPasswordExpires: {
            type: DataTypes.DATE
        }
    }, {
        hooks: {
            beforeSave: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        },
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    User.prototype.validatePassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    User.prototype.generateAuthToken = function () {
        return jwt.sign(
            {
                id: this.id,
                email: this.email,
                plan: this.subscriptionPlan
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    };

    User.prototype.generateRefreshToken = function () {
        return jwt.sign(
            { id: this.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
        );
    };

    User.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        delete values.password;
        delete values.twoFactorSecret;
        delete values.resetPasswordToken;
        delete values.resetPasswordExpires;
        return values;
    };

    return User;
};
