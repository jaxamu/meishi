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
const category_1 = require("../../models/category");
const user_profile_1 = require("../../models/user-profile");
const md5 = require("md5");
const user_auth_1 = require("../../middlewares/user_auth");
const cookbook_1 = require("../../models/cookbook");
const Tree_1 = require("../../libs/Tree");
let MainUserController = class MainUserController {
    /**
     * 渲染一个注册的页面给用户
     */
    register(ctx) {
        ctx.body = ctx.template.render('user/register.html');
    }
    /**
     * 渲染一个注册的页面给用户
     */
    logout(ctx) {
        // 向客户端发送一个cookie，把用户登录状态的cookie设置为null
        ctx.session = null;
        // 退出成功以后，重定向到另外一个地址
        // 我们希望从哪个页面退出的，退出成功以后返回到来源页面
        // http-header：referer，来源页面url
        if (ctx.req.headers.referer) {
            ctx.redirect(ctx.req.headers.referer);
        }
        else {
            ctx.redirect('/');
        }
    }
    /**
     * 用户个人中心首页
     */
    index(ctx) {
        ctx.body = ctx.template.render('user/user_index.html', {
            active: 'index',
            user: ctx.state.user
        });
    }
    /**
     * 用户个人中心基本资料
     */
    async profile(ctx) {
        /**
         * 获取到当前登录用户的基本资料数据
         */
        let userProfile = await user_profile_1.default.findOne({
            where: { userId: ctx.session.id }
        });
        // console.log(userProfile.toJSON());
        ctx.body = ctx.template.render('user/user_profile.html', {
            user: ctx.state.user,
            profile: userProfile.toJSON(),
            active: 'profile',
        });
    }
    /**
     * 我的菜谱
     */
    async cookbook(ctx) {
        let rs = await cookbook_1.default.findAndCountAll({
            where: {
                userId: ctx.session.id
            },
            order: [['createdAt', 'DESC']]
        });
        ctx.body = ctx.template.render('user/user_cookbook.html', {
            user: ctx.state.user,
            rs,
            active: 'cookbook',
        });
    }
    /**
     * 发布新菜谱
     */
    async publish(ctx) {
        /**
         * 获取到所有的分类
         */
        let categories = await category_1.default.findAll();
        let data = categories.map(category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            };
        });
        categories = (new Tree_1.default(data)).getTree(0);
        ctx.body = ctx.template.render('user/user_publish.html', {
            user: ctx.state.user,
            active: 'cookbook',
            categories
        });
    }
    /**
    * 删除指定菜谱
    */
    async cookbookRemove(ctx) {
        let id = ctx.params.id || 0;
        let cookbook = await cookbook_1.default.findById(id);
        await cookbook.destroy();
        ctx.redirect('/user/cookbook');
    }
    /**
     * 编辑指定菜谱
     */
    async cookbookEdit(ctx) {
        let id = ctx.params.id || 0;
        /**
         * 获取到所有的分类
         */
        let categories = await category_1.default.findAll();
        let data = categories.map(category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            };
        });
        categories = (new Tree_1.default(data)).getTree(0);
        let rs = await cookbook_1.default.findById(id);
        let cookbook = rs.toJSON();
        cookbook.covers = JSON.parse(cookbook.covers);
        cookbook.ingredients = JSON.parse(cookbook.ingredients);
        cookbook.cookers = JSON.parse(cookbook.cookers);
        cookbook.steps = JSON.parse(cookbook.steps);
        // console.log(cookbook);
        ctx.body = ctx.template.render('user/user_edit.html', {
            user: ctx.state.user,
            active: 'cookbook',
            categories,
            cookbook
        });
    }
    /**
     * 接收用户传入的注册信息，然后进行验证，返回注册结果
     */
    async postRegister(ctx) {
        let body = ctx.request.body;
        let username = body.username || '';
        let password = body.password || '';
        let repassword = body.repassword || '';
        // console.log(username, password, repassword);
        if (username.trim() === '' || password.trim() === '') {
            return ctx.body = {
                code: 1,
                message: '用户名或密码不能为空'
            };
        }
        if (password !== repassword) {
            return ctx.body = {
                code: 2,
                message: '两次输入的密码不一致'
            };
        }
        /**
         * 验证用户名是否已经被注册过了：这个时候需要查询数据库，查看数据库中是否有相同username的数据存在，如果有表示用户名已经被注册了
         */
        let user = await user_1.default.findOne({
            where: {
                username: username
            }
        });
        if (user) {
            return ctx.body = {
                code: 3,
                message: '用户名已经被注册了'
            };
        }
        user = user_1.default.build({
            username,
            password: md5(password),
            // 一旦注册，这个ip永远都不会在改变了
            createdIpAt: ctx.ip,
            // 每次登陆都会更新的
            updatedIpAt: ctx.ip
        });
        // 通过以上的所有验证，那么就可以把用户注册信息保存到数据库了
        await user.save();
        ctx.body = {
            code: 0,
            message: '注册成功'
        };
    }
    /**
     * 渲染一个登录的页面给用户
     */
    login(ctx) {
        ctx.body = ctx.template.render('user/login.html');
    }
    /**
     * 验证用户登录
     */
    async postLogin(ctx) {
        /**
         * 接收username和password
         */
        let body = ctx.request.body;
        let username = body.username || '';
        let password = body.password || '';
        let rememberPass = body.rememberPass;
        if (username.trim() === '' || password.trim() === '') {
            return ctx.body = {
                code: 1,
                message: '用户名或密码不能为空'
            };
        }
        /**
         * 验证数据库中是否存在该用户并且密码是正确的
         */
        let user = await user_1.default.findOne({
            where: { username }
        });
        /**
         * 登录的时候发送的密码是明文，但是数据库中的密码是加密过的，我们需要把登录传过来的密码进行加密，然后再和数据库中密码进行比较
         */
        if (!user || md5(password) !== user.get('password')) {
            return ctx.body = {
                code: 2,
                message: '用户不存在或密码错误'
            };
        }
        // 当前用户是否是禁用状态
        if (user.get('disabled')) {
            return ctx.body = {
                code: 3,
                message: '该用户已经被禁用了'
            };
        }
        // 当用户登录成功以后，把能够标识用户身份信息的值通过cookie/session发送给用户（浏览器）
        // 默认情况下cookie是回话结束（浏览器关闭）自动销毁，如果我们想保持cookie长期存在，则需要设置cookie的maxAge，毫秒
        if (rememberPass) {
            ctx.session.maxAge = 1000 * 60 * 60 * 24 * 10;
        }
        ctx.session.id = user.get('id');
        return ctx.body = {
            code: 0,
            message: '登录成功'
        };
    }
    /**
     * 上传头像
     */
    async postAvatar(avatar, ctx) {
        // avatar存储的是上传成功以后的文件信息
        // console.log(avatar);
        let user = await user_1.default.findById(ctx.session.id);
        user.set('avatar', avatar.filename);
        await user.save();
        ctx.body = {
            code: 0,
            data: {
                url: avatar.filename
            }
        };
    }
    /**
     * 个人基本资料修改
     */
    async postProfile(ctx) {
        let body = ctx.request.body;
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
            where: { userId: ctx.session.id }
        });
        // 如果用户传递过来了mobile，则修改
        mobile && userProfile.set('mobile', mobile);
        email && userProfile.set('email', email);
        realname && userProfile.set('realname', realname);
        gender && userProfile.set('gender', gender);
        // 注意：请求发送过来的年月日是字符串信息，数据库中存储的日期格式的，所以，我们需要把用户传递过来的日期字符串编程日期对象
        let d = new Date(userProfile.get('birthday'));
        year && d.setFullYear(year);
        month && d.setMonth(month - 1); // 请求的时候发送的月份是从1开始计算
        date && d.setDate(date);
        userProfile.set('birthday', d);
        /**
         * 这是我犯的低级错误！！！
         */
        await userProfile.save();
        ctx.body = {
            code: 0,
            data: userProfile
        };
    }
    /**
     * 发布新菜谱接口
     */
    async postPublish(ctx) {
        let body = ctx.request.body;
        let name = body.name || '';
        let categoryId = body.categoryId || 0;
        let covers = body.covers || [];
        let description = body.description || '';
        let craft = body.craft || '';
        let level = body.level || '';
        let taste = body.taste || '';
        let needTime = body.needTime || '';
        let cookers = body.cookers || [];
        let ingredients = body.ingredients || { m: [], s: [] };
        let steps = body.steps || [];
        let tips = body.tips || '';
        if (!name) {
            return ctx.body = {
                code: 1,
                message: '菜谱名称不能为空'
            };
        }
        let cookbook = cookbook_1.default.build({
            name,
            userId: ctx.session.id,
            categoryId,
            covers: JSON.stringify(covers),
            description,
            craft,
            level,
            taste,
            needTime,
            cookers: JSON.stringify(cookers),
            ingredients: JSON.stringify(ingredients),
            steps: JSON.stringify(steps),
            tips
        });
        await cookbook.save();
        ctx.body = {
            code: 0,
            data: cookbook
        };
    }
    /**
     * 修改
     */
    async postCookbookEdit(ctx) {
        let body = ctx.request.body;
        if (!body.name) {
            return ctx.body = {
                code: 1,
                message: '菜谱名称不能为空'
            };
        }
        let cookbook = await cookbook_1.default.findById(body.id);
        body.name && cookbook.set('name', body.name);
        body.categoryId && cookbook.set('categoryId', body.categoryId);
        body.covers && cookbook.set('covers', JSON.stringify(body.covers));
        body.description && cookbook.set('description', body.description);
        body.craft && cookbook.set('craft', body.craft);
        body.level && cookbook.set('level', body.level);
        body.taste && cookbook.set('taste', body.taste);
        body.needTime && cookbook.set('needTime', body.needTime);
        body.cookers && cookbook.set('cookers', JSON.stringify(body.cookers));
        body.ingredients && cookbook.set('ingredients', JSON.stringify(body.ingredients));
        body.steps && cookbook.set('steps', JSON.stringify(body.steps));
        body.tips && cookbook.set('tips', body.tips);
        await cookbook.save();
        ctx.body = {
            code: 0,
            data: cookbook
        };
    }
    /**
     * 上传成品图
     */
    async postPublishCover(cover, ctx) {
        // avatar存储的是上传成功以后的文件信息
        // console.log(cover);
        ctx.body = {
            code: 0,
            data: {
                url: cover.filename
            }
        };
    }
};
__decorate([
    koa_controllers_1.Get('/user/register'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MainUserController.prototype, "register", null);
__decorate([
    koa_controllers_1.Get('/user/logout'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MainUserController.prototype, "logout", null);
__decorate([
    koa_controllers_1.Get('/user'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MainUserController.prototype, "index", null);
__decorate([
    koa_controllers_1.Get('/user/profile'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "profile", null);
__decorate([
    koa_controllers_1.Get('/user/cookbook'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "cookbook", null);
__decorate([
    koa_controllers_1.Get('/user/publish'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "publish", null);
__decorate([
    koa_controllers_1.Get('/user/cookbook/remove/:id(\\d+)'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "cookbookRemove", null);
__decorate([
    koa_controllers_1.Get('/user/cookbook/edit/:id(\\d+)'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "cookbookEdit", null);
__decorate([
    koa_controllers_1.Post('/user/register'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postRegister", null);
__decorate([
    koa_controllers_1.Get('/user/login'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MainUserController.prototype, "login", null);
__decorate([
    koa_controllers_1.Post('/user/login'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postLogin", null);
__decorate([
    koa_controllers_1.Post('/user/avatar'),
    koa_controllers_1.Before(user_auth_1.default)
    /**
     * RequestParam
     *  解析请求中的提交数据，把参数中的key，提取出来赋值给后面的变量
     *  file: true，表示提取的数据是一个文件（二进制）
     */
    ,
    __param(0, koa_controllers_1.RequestParam('avatar', { file: true })), __param(1, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postAvatar", null);
__decorate([
    koa_controllers_1.Post('/user/profile'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postProfile", null);
__decorate([
    koa_controllers_1.Post('/user/publish'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postPublish", null);
__decorate([
    koa_controllers_1.Post('/user/cookbook/edit'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postCookbookEdit", null);
__decorate([
    koa_controllers_1.Post('/user/publish/cover'),
    koa_controllers_1.Before(user_auth_1.default),
    __param(0, koa_controllers_1.RequestParam('cover', { file: true })), __param(1, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MainUserController.prototype, "postPublishCover", null);
MainUserController = __decorate([
    koa_controllers_1.Controller
], MainUserController);
exports.MainUserController = MainUserController;
