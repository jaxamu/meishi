'use strict';

module.exports = {
 
  up: (queryInterface, Sequelize) => {
    
    /**
     * 增加一个头像字段avatar
     */
    return queryInterface.addColumn('user', 'avatar', {
      type: Sequelize.STRING,
      allowNull: false,
      default: ''
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'avatar');
  }
};
