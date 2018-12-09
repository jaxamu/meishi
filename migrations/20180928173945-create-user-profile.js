'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user-profile', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
        type: Sequelize.ENUM(['男','女','保密']),
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
      tableName: 'user-profile',
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
      indexes: [
        {
          
        }
      ]
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user-profile');
  }
};