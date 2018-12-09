"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_controllers_1 = require("koa-controllers");
const category_1 = require("../../models/category");
const Tree_1 = require("../../libs/Tree");
/**
 * 把一个普通的类装饰成 控制器类
 *
 * 控制器的作用
 *  接收处理用户的请求，并控制返回对应的数据
 *
 *  我们需要在控制器中进行路由配置和基本逻辑控制以及最后的输出控制
 *
 * 在控制器中配置路由信息
 *  一个路由对应一个控制器的方法
 *  当某个请求符合某个控制器的方法绑定的路由的时候，就会执行对应这个方法
 */
let MainIndexController = class MainIndexController {
    /**
     * 当请求是 / 这个地址的时候，那么对应下面的index方法就会被执行
     * 如果我们要在一个路由绑定的方法中使用 ctx 对象，那么就需要使用另外一个装饰器
     * @Ctx ：把参数包装成 koa.context 对象
     */
    async index(ctx) {
        // console.log('首页', ctx);
        // ctx.body = '首页';
        /**
         * 通过模板引擎渲染
         *  第一个参数：模板的存放路径和名称，这里的路径和名称是相对于FileSystemLoader设置的目录来查找的
         *  第二个参数：模板中使用到的数据，类似vue中的data
         */
        // console.log(ctx.template.render('index.html'));
        // ctx.body = ctx.template.render('index.html', {
        //     appName: '美食'
        // });
        // 从数据库中读取数据
        let categories = await category_1.default.findAll();
        let data = categories.map(category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            };
        });
        // console.log(data);
        data = (new Tree_1.default(data)).getTree(0);
        // console.log(data);
        ctx.body = ctx.template.render('index.html', {
            categories: data
        });
    }
};
__decorate([
    koa_controllers_1.Get('/'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainIndexController.prototype, "index", null);
MainIndexController = __decorate([
    koa_controllers_1.Controller
], MainIndexController);
exports.MainIndexController = MainIndexController;
