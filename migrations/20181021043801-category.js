'use strict';

/**
 * 因为这个迁移文件是被 sequelize-cli 去读取执行的，而 sequelize 是基于 node 的，所以我们这个迁移文件是一个node环境下的执行文件
 * 
 * 一个迁移文件其实就是一个node模块，这个模块通过 node下的module.exports 导出了一个对象
 * 这个对象下包含两个方法：
 *  up
 *  down
 * 这两个方法会在我们执行 sequelize-cli 的某些命令的时候进行调用
 */
module.exports = {
  /**
   * queryInterface,Sequelize这两个参数是 sequelize-cli 在调用up方法的时候传进来的
   *  queryInterface：该对象下提供了一系列的用来操作数据库结构的方法，比如 添加字段、修改字段、删除字段、添加索引，也包含了一些操作数据的方法，比如批量添加数据、批量删除数据
   *  Sequelize: 是框架的顶层对象，提供了一些框架中需要使用到的通用的一些数据和方法
   */
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    
    /**
     * createTable: 创建表
     */
    return queryInterface.createTable('category', { 
      id: {
        // 字段类型
        type: Sequelize.INTEGER,
        // 主键
        primaryKey: true,
        // 自动增长
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      pid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    }, {
      charset: "utf8mb4",
      collate: "utf8mb4_bin"
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('category');
  }
};
