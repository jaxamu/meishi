import * as Sequelize from 'sequelize'; // 导出来的是具体的类
import {Instance} from 'sequelize';  // 导出来的是类型
import sequelize from './index';
import Fields from './field_interface';

interface UserProfileFields extends Fields {
  userId: number;
  mobile: string;
  email: string;
  realname: string;
  gender: string;
  birthday: Date;
}

export default sequelize.define<Instance<UserProfileFields>, UserProfileFields>('user-profile', {
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
    tableName: 'user-profile'
  });