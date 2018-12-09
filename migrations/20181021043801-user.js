'use strict';

module.exports = {
 
  up: (queryInterface, Sequelize) => {
    
    /**
     * 用户表
     */
    return queryInterface.createTable('user', {
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
      }
    }, {
      charset: "utf8mb4",
      collate: "utf8mb4_bin"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user');
  }
};
