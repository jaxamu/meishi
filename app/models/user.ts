import * as Sequelize from 'sequelize'; 
import {Instance} from 'sequelize';
import sequelize from './index';
import Fields from './field_interface';

interface UserFields extends Fields {
    username?: string;
    password?: string;
    disabled?: boolean;
    createdIpAt?: string;
    updatedIpAt?: string;
    avatar?: string;
}


export default sequelize.define<Instance<UserFields>, UserFields>('user', {
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