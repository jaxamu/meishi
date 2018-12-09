"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const index_1 = require("./index");
exports.default = index_1.default.define('user', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    username: {
        type: Sequelize.STRING(50),
        // 唯一值
        unique: true,
        allowNull: false,
        defaultValue: ''
    },
    password: {
        type: Sequelize.CHAR(32),
        allowNull: false,
        defaultValue: ''
    },
    disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdIpAt: {
        type: Sequelize.CHAR(15),
        allowNull: false,
        defaultValue: ''
    },
    updatedIpAt: {
        type: Sequelize.CHAR(15),
        allowNull: false,
        defaultValue: ''
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
    }
}, {
    tableName: 'user'
});
