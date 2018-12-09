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
const Sequelize = require("sequelize");
const category_1 = require("../../models/category");
const Tree_1 = require("../../libs/Tree");
let AdminCategoryController = class AdminCategoryController {
    async index(ctx) {
        let categories = await category_1.default.findAll();
        let data = categories.map(category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            };
        });
        data = (new Tree_1.default(data)).getTree(0);
        ctx.body = {
            code: 0,
            data
        };
    }
    async add(ctx) {
        /**
         * 接收name和pid
         * 通过 ctx.request.body
         */
        let body = ctx.request.body;
        let name = body.name || '';
        let pid = 0;
        if (!isNaN(Number(body.pid))) {
            pid = Number(body.pid);
        }
        // 验证
        // name 不能为空
        if (name == '') {
            return ctx.body = {
                code: 1,
                message: '分类名称不能为空'
            };
        }
        let data = category_1.default.build({
            name, pid
        });
        await data.save();
        ctx.body = {
            code: 0,
            data
        };
    }
    async edit(ctx) {
        /**
         * 接收id和name
         */
        let body = ctx.request.body;
        let name = body.name || '';
        let id = 0;
        if (!isNaN(Number(body.id))) {
            id = Number(body.id);
        }
        // 验证
        // name 不能为空
        if (name == '') {
            return ctx.body = {
                code: 1,
                message: '分类名称不能为空'
            };
        }
        // 根据传入的id，查找对应的记录
        let data = await category_1.default.findById(id);
        if (!data) {
            return ctx.body = {
                code: 2,
                message: '不存在该分类'
            };
        }
        data.set('name', name);
        await data.save();
        ctx.body = {
            code: 0,
            data
        };
    }
    async remove(ctx) {
        /**
         * 接收id
         */
        let body = ctx.request.body;
        let id = 0;
        if (!isNaN(Number(body.id))) {
            id = Number(body.id);
        }
        // 根据传入的id，查找对应的记录
        /**
         * 一个模型类对应一个数据库中的表
         * new 模型对象对应的当前这个表中某条数据
         */
        // 单条数据的删除可以是下面这个做法
        // let data = await CategoryModel.findById(id);
        // if (!data) {
        //     return ctx.body = {
        //         code: 2,
        //         message: '不存在该分类'
        //     }
        // }
        // await data.destroy();   //删除
        // 如果要删除多条数据，那么是针对某个表进行操作，这个就要调用模型类下的静态方法去完成
        // where id = id or pid = id
        // 我们只是考虑两层
        await category_1.default.destroy({
            where: {
                [Sequelize.Op.or]: [
                    { id: id },
                    { pid: id }
                ]
            }
        });
        ctx.body = {
            code: 0
        };
    }
};
__decorate([
    koa_controllers_1.Get('/api/admin/category'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCategoryController.prototype, "index", null);
__decorate([
    koa_controllers_1.Post('/api/admin/category/add'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCategoryController.prototype, "add", null);
__decorate([
    koa_controllers_1.Post('/api/admin/category/edit'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCategoryController.prototype, "edit", null);
__decorate([
    koa_controllers_1.Post('/api/admin/category/remove'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCategoryController.prototype, "remove", null);
AdminCategoryController = __decorate([
    koa_controllers_1.Controller
], AdminCategoryController);
exports.AdminCategoryController = AdminCategoryController;
