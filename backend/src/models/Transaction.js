const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // userId and categoryId will be added by associations in models/index.js
        type: {
            type: DataTypes.ENUM('income', 'expense'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                min: 0.01,
                max: 999999.99
            }
        },
        description: {
            type: DataTypes.STRING(500),
            validate: {
                len: [0, 500]
            }
        },
        transactionDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                isDate: true,
                isNotFuture(value) {
                    if (new Date(value) > new Date()) {
                        throw new Error('Transaction date cannot be in the future');
                    }
                }
            }
        },
        receiptImageUrl: {
            type: DataTypes.STRING(500),
            validate: {
                isUrl: true
            }
        },
        isOcrProcessed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ocrConfidence: {
            type: DataTypes.DECIMAL(3, 2),
            validate: {
                min: 0,
                max: 1
            }
        },
        tags: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        isRecurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        recurringPattern: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly')
        },
        recurringEndDate: {
            type: DataTypes.DATEONLY
        },
        splitTransactions: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        indexes: [
            {
                fields: ['userId', 'transactionDate']
            },
            {
                fields: ['userId', 'categoryId']
            },
            {
                fields: ['userId', 'type']
            },
            {
                fields: ['transactionDate']
            }
        ]
    });

    // Instance methods
    Transaction.prototype.getFormattedAmount = function () {
        return this.type === 'expense'
            ? `-$${Math.abs(this.amount).toFixed(2)}`
            : `$${this.amount.toFixed(2)}`;
    };

    // Class methods
    Transaction.getMonthlySummary = async function (userId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.findAll({
            where: {
                userId,
                transactionDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'type',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['type']
        });
    };

    return Transaction;
};
