import * as Sequelize from 'sequelize'; // 导出来的是具体的类
import {Instance} from 'sequelize';  // 导出来的是类型
import sequelize from './index';
import Fields from './field_interface';

/**
 * 创建模型对象
 *  define方法需要传入两个泛型
 *      Instance<{}>：决定了通过CategoryModel操作的数据是一个Model的Instance对象，这样的话，后续才能调用get,set等方法，Instance<{}>中的{}决定了get和set能传入字段名称
 *      第二个泛型决定了define中可以定义的字段名称
 */

// interface Fields {
//     id?:number;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

interface CateogryFields extends Fields {
    name?:string;
    pid?: number;
}


export default sequelize.define<Instance<CateogryFields>, CateogryFields>('category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
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
    // 默认表的名称会是对应模型名称的复数形式，根据实际情况，当前应用的表的名称和模型名称是一致的，所以这里可以单独设置表名
    tableName: 'category'
});