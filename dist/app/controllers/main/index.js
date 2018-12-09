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
const user_1 = require("../../models/user");
const cookbook_1 = require("../../models/cookbook");
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
        // console.log(ctx.session);
        // console.log(data);
        data = (new Tree_1.default(data)).getTree(0);
        // console.log(data);
        // 美食数据
        // 主要查询的是美食，然后根据美食的userId字段关联查询user表中的数据
        cookbook_1.default.belongsTo(user_1.default, {
            // 关联字段（外键）
            foreignKey: 'userId'
        });
        let cookbooksResults = await cookbook_1.default.findAll({
            limit: 16,
            include: [{
                    model: user_1.default,
                    attributes: ['username']
                }]
        });
        let cookbooks = cookbooksResults.map(cookbook => {
            // console.log(cookbook.get('user'));
            return {
                id: cookbook.get('id'),
                name: cookbook.get('name'),
                userId: cookbook.get('userId'),
                username: cookbook.get('user').get('username'),
                cover: cookbook.get('covers') === '' ? '' : JSON.parse(cookbook.get('covers'))[0]
            };
        });
        // console.log(cookbooks);
        ctx.body = ctx.template.render('index.html', {
            categories: data,
            user: ctx.state.user,
            cookbooks
        });
    }
    /**
     * 美食列表页面
     */
    async list(ctx) {
        // console.log(ctx.params.categoryId);
        let categoryId = ctx.params.categoryId;
        let page = ctx.query.page || 1; //?page=1
        let limit = 10;
        let offset = (page - 1) * limit;
        // 获取分类
        let categories = await category_1.default.findAll();
        // 根据categoryId获取对应分类下的所有美食，如果传入的categoryId的值是undefined，那么where就是空的
        let where = {};
        let categoryName = '全部';
        if (categoryId) {
            where.categoryId = categoryId;
            categoryName = categories.find(cate => cate.get('id') == categoryId).get('name');
        }
        cookbook_1.default.belongsTo(user_1.default, {
            // 关联字段（外键）
            foreignKey: 'userId'
        });
        let rs = await cookbook_1.default.findAndCountAll({
            where: where,
            include: [{
                    model: user_1.default,
                    attributes: ['username']
                }],
            limit,
            offset
        });
        // console.log(Cookbooks.length);
        let cookbooks = rs.rows.map(cookbook => {
            // 处理原料字段
            let ingredients = cookbook.get('ingredients') ? JSON.parse(cookbook.get('ingredients')) : { m: [], s: [] };
            // console.log([...ingredients.m.map(val => val.k), ...ingredients.s.map(val => val.k)]);
            return Object.assign(cookbook, {
                covers: cookbook.get('covers') ? JSON.parse(cookbook.get('covers')) : [],
                ingredients: [...ingredients.m.map(val => val.k), ...ingredients.s.map(val => val.k)],
                steps: cookbook.get('steps') ? JSON.parse(cookbook.get('steps')) : [],
                username: cookbook.get('user').username,
            });
        });
        // 当请求的page与当前数据库中数据的总页码数是一致的，那就表明用户想看的页面已经是最后一页了，也就是后面再也没有数据了
        let pages = Math.ceil((rs.count / limit));
        let isMore = page < pages;
        if (ctx.headers['x-requested-with'] === 'XMLHttpRequest') {
            ctx.body = {
                cookbooks,
                isMore
            };
        }
        else {
            ctx.body = ctx.template.render('list.html', {
                user: ctx.state.user,
                categories,
                categoryId,
                categoryName,
                count: rs.count,
                cookbooks,
                isMore
            });
        }
    }
    /**
     * 美食详情页面
     * 当访问的url匹配了当前的路由以后，会把view后面的值赋值给id，在我们的方法就可以通过
     * ctx.params.id 拿到该值
     *
     * (\\d+)：view/ 后面的值只匹配数字类型的值
     */
    async view(ctx) {
        let id = ctx.params.id;
        // console.log(id);
        // 获取分类
        let categories = await category_1.default.findAll();
        cookbook_1.default.belongsTo(user_1.default, {
            // 关联字段（外键）
            foreignKey: 'userId'
        });
        cookbook_1.default.belongsTo(category_1.default, {
            // 关联字段（外键）
            foreignKey: 'categoryId'
        });
        let cookbook = await cookbook_1.default.findById(id, {
            include: [user_1.default, category_1.default]
        });
        // console.log(cookbook.toJSON());
        // console.log(typeof cookbook.get('covers'));
        cookbook = Object.assign(cookbook, {
            covers: cookbook.get('covers') ? JSON.parse(cookbook.get('covers')) : [],
            cookers: cookbook.get('cookers') ? JSON.parse(cookbook.get('cookers')) : [],
            ingredients: cookbook.get('ingredients') ? JSON.parse(cookbook.get('ingredients')) : { m: [], s: [] },
            steps: cookbook.get('steps') ? JSON.parse(cookbook.get('steps')) : [],
            username: cookbook.get('user').username,
            avatar: cookbook.get('user').avatar ? cookbook.get('user').avatar : "avatar.jpg"
        });
        ctx.body = ctx.template.render('view.html', {
            cookbook,
            user: ctx.state.user,
            categories,
            categoryId: cookbook.get('categoryId'),
            categoryName: cookbook.get('category').name
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
__decorate([
    koa_controllers_1.Get('/list/:categoryId(\\d+)?'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainIndexController.prototype, "list", null);
__decorate([
    koa_controllers_1.Get('/view/:id(\\d+)'),
    __param(0, koa_controllers_1.Ctx),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainIndexController.prototype, "view", null);
MainIndexController = __decorate([
    koa_controllers_1.Controller
], MainIndexController);
exports.MainIndexController = MainIndexController;
