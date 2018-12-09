import * as Sequelize from 'sequelize';
import sequelize from './index';
import Fields from './field_interface';

interface CookbookFields extends Fields {
  name?:string;
  userId?: number;
  categoryId?: number;
  covers?: string;
  description?: string;
  craft?: string;
  level?: string;
  taste?: string;
  needTime?: string;
  cookers?: string;
  ingredients?: string;
  steps?: string;
  tips?: string;
  favoriteCount?: number;
  commentCount?: number;
  user?: any;
  category?: any;
}

const CookbookModel = sequelize.define<Sequelize.Instance<CookbookFields>, CookbookFields>('cookbook', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
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
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'category',
      key: 'id'
    }
  },
  covers: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  description: {
    type: Sequelize.STRING(2000),
    allowNull: false,
    defaultValue: ''
  },
  craft: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  level: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  taste: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  needTime: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  cookers: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  ingredients: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  },
  steps: {
    type: Sequelize.STRING(2000),
    allowNull: false,
    defaultValue: ''
  },
  tips: {
    type: Sequelize.STRING(2000),
    allowNull: false,
    defaultValue: '',
  },
  favoriteCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  commentCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
}, {
    tableName: 'cookbook',
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin'
  });

export default CookbookModel;