"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
// import Koa = require('koa');
const KoaStaticCache = require("koa-static-cache");
const Nunjucks = require("nunjucks");
const KoaBodyParser = require("koa-bodyparser");
const KoaSession = require("koa-session");
const koa_controllers_1 = require("koa-controllers");
const user_1 = require("./models/user");
const KoaMulter = require("koa-multer");
const mime = require("mime");
const url = require("url");
const querystring = require("querystring");
const configs = require("../config/config.json");
const app = new Koa();
/**
 * 接收两个参数
 *  1. 配置：包括httpOnly，maxAge
 *  2. 当前app
 */
app.keys = ['miaov'];
app.use(KoaSession({}, app));
/**
 * 设置上传文件的存储引擎
 *  - diskStorage: 设置硬盘存储引擎
 */
const storage = KoaMulter.diskStorage({
    // destination : 设置存储目录
    // destination: process.cwd() + '/static/uploads/avatar',
    destination(req, file, cb) {
        /**
         * 上传的时候同时通过querystring传递过来一个type值，type值表示上传文件类型：默认是avatar，也可以是cookbooks
         * 注意：当前的req是原生的(node)
         */
        // console.log(req.url);
        let query = {};
        let type = 'avatar';
        let queryString = url.parse(req.url).query;
        if (queryString) {
            query = querystring.parse(queryString);
        }
        // console.log(query);
        switch (query.type) {
            case 'cookbooks':
                type = 'cookbooks';
                break;
        }
        cb(null, process.cwd() + '/static/uploads/' + type);
    },
    filename(req, file, cb) {
        // file存储的是上传以前的文件信息
        // 通过调用cb来手动设置当前文件名称
        // 当有错误的时候，第一个参数是错误信息
        // 第二个参数就是存储文件名称
        // console.log(file);
        // console.log( mime.getExtension(file.mimetype) );
        // 通过mime.getExtension方法获取到上传的类型，进行存储
        let filename = Date.now() + '_' + (Math.random() + '').substring(2);
        cb(null, filename + '.' + mime.getExtension(file.mimetype));
    }
});
// 访问的url中以 /public 开始的，那么都映射到 static 目录中
app.use(KoaStaticCache('./static', {
    gzip: true,
    prefix: '/public',
    // dynamic：设置静态文件每次访问都从文件（硬盘）中读取，有利于开发调试，不过在代码上线以后可以设置成非动态读取，那么程序运行的时候就会主动把静态文件内容预加载进内存，访问的时候就直接从内存中读取，提高性能
    dynamic: true
}));
// 处理bodyParser
app.use(KoaBodyParser());
app.use(async (ctx, next) => {
    /**
     * 根据当前的cookie来获取用户的详细信息
     */
    ctx.state.user = {};
    if (ctx.session.id) {
        // 当前访问的用户是登录的，则获取当前用户详细信息
        ctx.state.user = await user_1.default.findById(ctx.session.id);
        if (!ctx.state.user.avatar) {
            ctx.state.user.avatar = 'avatar.jpg';
        }
    }
    // 在ctx对象下挂载一个template属性，用于存放模板引擎
    /**
     * 创建模板引擎实例对象
     *  Nunjucks.Environment()
     */
    ctx.template = new Nunjucks.Environment(
    // 设置模板加载方式，因为这里是基于node，所以使用fs
    // __dirname : 当前这个文件的所在的绝对路径
    // new Nunjucks.FileSystemLoader( __dirname + '/../../views/' )
    // process.cwd() : 当前运行该文件的命令（node、supervisor）所在目录
    new Nunjucks.FileSystemLoader(process.cwd() + '/views/'));
    // /app
    //     index.ts
    // /dist
    //     /app
    //         index.js
    // /views
    //     index.html
    await next();
});
/**
 * useControllers 第一个参数是当前应用 app 对象
 * useControllers 会自动加载通过第二个参数指定的文件，加载进来的文件就是控制器文件了，控制器文件的路径，我们可以通过 Path-to-RegExp 来声明
 *
 * Path-to-RegExp 是一个基于node的类正则路径的表示
 */
koa_controllers_1.useControllers(app, 
/**
 * 控制器文件一定要设置成 .js 的（不是.ts）
 * 因为当前ts文件我们需要编译以后在交给node去执行的
 * 而tsc编译器并不会把字符串中的 .ts 编译成 .js
 * 控制器虽然是ts写的，但是编译以后会变成.js，所以字符串中不能填.ts，而是要填写编译的控制器文件 .js
 * * : 任意文件名
 * **: 任意目录
 */
__dirname + '/controllers/**/*.js', {
    // koa-controllers 框架内置使用了 koa-multer
    multipart: {
        // 设置上传的目录
        dest: process.cwd() + '/static/uploads/avatar',
        // 设置功能更加强大的存储配置
        storage
    }
});
const env = process.env.NODE_ENV || 'development';
const config = configs[env];
app.listen(config.web.port);
