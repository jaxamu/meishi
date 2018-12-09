"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize"); // 导出来的是具体的类
const index_1 = require("./index");
exports.default = index_1.default.define('user-profile', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    mobile: {
        type: Sequelize.CHAR(12),
        allowNull: false,
        defaultValue: ''
    },
    email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: ''
    },
    realname: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
    },
    gender: {
        type: Sequelize.ENUM(['男', '女', '保密']),
        allowNull: false,
        defaultValue: '保密'
    },
    birthday: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
    }
}, {
    tableName: 'user-profile'
});
