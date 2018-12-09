"use strict";
/**
 * 数据库操作模型文件
 *
 * 1. 通过sequelize来连接数据库，得到一个sequelize对象，
 * 2. 通过sequelize对象来创建模型类
 * 3. 在程序中通过不同的模型类来完成对数据库的操作
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize"); // 导出来的是具体的类
const configs = require("../../config/config.json");
// console.log(configs);
//  1. 连接数据库 - 通过Sequelize类对象来完成对数据库的连接
//  因为 sequelize 是 js，同时默认也没有提供 d.ts 的类型声明文件，所以需要单独配置，npm i -D @types/sequelize
// 根据当前环境变量来动态加载对应config
// nodejs: process.env 获取环境变量的值，NODE_ENV这个名字的环境变量
const env = process.env.NODE_ENV || 'development';
const config = configs[env];
// console.log(config);
exports.default = new Sequelize(config.database, config.username, config.password, config);
