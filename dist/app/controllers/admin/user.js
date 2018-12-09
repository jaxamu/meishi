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
const user_1 = require("../../models/user");
const user_profile_1 = require("../../models/user-profile");
let AdminUserController = class AdminUserController {
    async index(ctx) {
        // 页码从1开始计算
        let page = Number(ctx.query.page) || 1;
        // 每页显示的记录条数
        let limit = 10;
        let offset = (page - 1) * limit;
        user_1.default.hasOne(user_profile_1.default);
        let users = await user_1.default.findAndCountAll({
            // attributes: ['id', 'username']
            attributes: {
                exclude: ['password']
            },
            // 每次返回2条数据
            limit,
            // 记录数据的偏移值
            offset,
            include: [user_profile_1.default]
        });
        users.rows = users.rows.map((user) => {
            return Object.assign(user, { avatar: user.avatar === '' ? 'avatar.jpg' : user.avatar });
        });
        ctx.body = {
            code: 0,
            data: { ...users, limit, page }
        };
    }
    async status(ctx) {
        let body = ctx.request.body;
        let id = Number(body.id);
        // 根据id获取当前数据库中对应的用户
        let user = await user_1.default.findById(id);
        // 如果没有该用户
        if (!user) {
            return ctx.body = {
                code: 1,
                message: '不存在该用户'
            };
        }
        user.set('disabled', !user.get('disabled'));
        await user.save();
        ctx.body = {
            code: 0,
            data: {
                id: user.get('id'),
                disabled: user.get('disabled')
            }
        };
    }
    async postProfile(ctx) {
        let body = ctx.request.body;
        let id = body.id;
        let mobile = body.mobile;
        let email = body.email;
        let realname = body.realname;
        let gender = body.gender;
        let year = body.year;
        let month = body.month;
        let date = body.date;
        /**
         * 获取到当前用户的基本信息对象
         */
        let userProfile = await user_profile_1.default.findOne({
            where: { userId: id }
        });
        // 如果用户传递过来了mobile，则修改
        mobile && userProfile.set('mobile', mobile);
        email && userProfile.set('email', email);
        realname && userProfile.set('realname', realname);
        gender && userProfile.set('gender', gender);
        let d = new Date(userProfile.get('birthday'));
        year && d.setFullYear(year);
        month && d.setMonth(month - 1);
        date && d.setDate(date);
        userProfile.set('birthday', d);
        await userProfile.save();
        ctx.body = {
            code: 0,
            data: userProfile
        };
    }
};
__decorate([
    koa_controllers_1.Get('/api/admin/user'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "index", null);
__decorate([
    koa_controllers_1.Post('/api/admin/user/status'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "status", null);
__decorate([
    koa_controllers_1.Post('/api/admin/user/profile'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "postProfile", null);
AdminUserController = __decorate([
    koa_controllers_1.Controller
], AdminUserController);
exports.AdminUserController = AdminUserController;
