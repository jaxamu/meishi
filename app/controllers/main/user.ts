import {Controller, Get, Ctx, Post, Before, RequestParam, MultipartFile} from 'koa-controllers';
import { Context } from 'koa';
import UserModel from '../../models/user';
import CategoryModel from '../../models/category';
import UserProfileModel from '../../models/user-profile';
import * as md5 from 'md5';
import UserAuth from '../../middlewares/user_auth';
import CookbookModel from '../../models/cookbook';
import Tree from '../../libs/Tree';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

@Controller
export class MainUserController {

    /**
     * 渲染一个注册的页面给用户
     */
    @Get('/user/register')
    public register(@Ctx ctx: Context) {

        ctx.body = ctx.template.render('user/register.html');

    }

    /**
     * 渲染一个注册的页面给用户
     */
    @Get('/user/logout')
    public logout(@Ctx ctx: Context) {

        // 向客户端发送一个cookie，把用户登录状态的cookie设置为null
        ctx.session = null;

        // 退出成功以后，重定向到另外一个地址
        // 我们希望从哪个页面退出的，退出成功以后返回到来源页面
        // http-header：referer，来源页面url
        if (ctx.req.headers.referer) {
            ctx.redirect(ctx.req.headers.referer);
        } else {
            ctx.redirect('/');
        }

    }

    /**
     * 用户个人中心首页
     */
    @Get('/user')
    @Before(UserAuth)
    public index(@Ctx ctx: Context) {

        ctx.body = ctx.template.render('user/user_index.html', {
            active: 'index',
            user: ctx.state.user
        });

    }

    /**
     * 用户个人中心基本资料
     */
    @Get('/user/profile')
    @Before(UserAuth)
    public async profile(@Ctx ctx: Context) {

        /**
         * 获取到当前登录用户的基本资料数据
         */
        let userProfile = await UserProfileModel.findOne({
            where: {userId: ctx.session.id}
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
    @Get('/user/cookbook')
    @Before(UserAuth)
    public async cookbook(@Ctx ctx: Context) {

        let rs = await CookbookModel.findAndCountAll({
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
    @Get('/user/publish')
    @Before(UserAuth)
    public async publish(@Ctx ctx: Context) {

        /**
         * 获取到所有的分类
         */
        let categories = await CategoryModel.findAll();
        
        let data = categories.map( category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            }
        } );


        categories = (new Tree(data)).getTree(0);

        ctx.body = ctx.template.render('user/user_publish.html', {
            user: ctx.state.user,
            active: 'cookbook',
            categories
        });

    }

     /**
     * 删除指定菜谱
     */
    @Get('/user/cookbook/remove/:id(\\d+)')
    @Before(UserAuth)
    public async cookbookRemove(@Ctx ctx: Context) {
        let id = ctx.params.id || 0;
        
        let cookbook = await CookbookModel.findById(id);
        await cookbook.destroy();

        ctx.redirect('/user/cookbook');
    }

    /**
     * 编辑指定菜谱
     */
    @Get('/user/cookbook/edit/:id(\\d+)')
    @Before(UserAuth)
    public async cookbookEdit(@Ctx ctx: Context) {
        let id = ctx.params.id || 0;

        /**
         * 获取到所有的分类
         */
        let categories = await CategoryModel.findAll();
        
        let data = categories.map( category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            }
        } );


        categories = (new Tree(data)).getTree(0);
        
        let rs = await CookbookModel.findById(id);
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
    @Post('/user/register')
    public async postRegister(@Ctx ctx: Context) {
        let body: any = ctx.request.body;
        let username = body.username || '';
        let password = body.password || '';
        let repassword = body.repassword || '';
        
        // console.log(username, password, repassword);

        if (username.trim() === '' || password.trim() === '') {
            return ctx.body = {
                code: 1,
                message: '用户名或密码不能为空'
            }
        }

        if (password !== repassword) {
            return ctx.body = {
                code: 2,
                message: '两次输入的密码不一致'
            }
        }

        /**
         * 验证用户名是否已经被注册过了：这个时候需要查询数据库，查看数据库中是否有相同username的数据存在，如果有表示用户名已经被注册了
         */
        let user = await UserModel.findOne({
            where: {
                username: username
            }
        });

        if (user) {
            return ctx.body = {
                code: 3,
                message: '用户名已经被注册了'
            }
        }

        user = UserModel.build({
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
    @Get('/user/login')
    public login(@Ctx ctx: Context) {

        ctx.body = ctx.template.render('user/login.html');

    }

    /**
     * 验证用户登录
     */
    @Post('/user/login')
    public async postLogin(@Ctx ctx: Context) {

        /**
         * 接收username和password
         */
        let body: any = ctx.request.body;
        let username = body.username || '';
        let password = body.password || '';
        let rememberPass = body.rememberPass;

        if (username.trim() === '' || password.trim() === '') {
            return ctx.body = {
                code: 1,
                message: '用户名或密码不能为空'
            }
        }

        /**
         * 验证数据库中是否存在该用户并且密码是正确的
         */
        let user = await UserModel.findOne({
            where: {username}
        });

        /**
         * 登录的时候发送的密码是明文，但是数据库中的密码是加密过的，我们需要把登录传过来的密码进行加密，然后再和数据库中密码进行比较
         */
        if (!user || md5(password) !== user.get('password')) {
            return ctx.body = {
                code: 2,
                message: '用户不存在或密码错误'
            }
        }

        // 当前用户是否是禁用状态
        if (user.get('disabled')) {
            return ctx.body = {
                code: 3,
                message: '该用户已经被禁用了'
            }
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
        }
    }

    /**
     * 上传头像
     */
    @Post('/user/avatar')
    @Before(UserAuth)
    /**
     * RequestParam
     *  解析请求中的提交数据，把参数中的key，提取出来赋值给后面的变量
     *  file: true，表示提取的数据是一个文件（二进制）
     */
    public async postAvatar(@RequestParam('avatar', {file: true}) avatar: MultipartFile, @Ctx ctx: Context) {

        // avatar存储的是上传成功以后的文件信息
        // console.log(avatar);
        let user = await UserModel.findById(ctx.session.id);

        user.set('avatar', avatar.filename);
        await user.save();

        ctx.body = {
            code: 0,
            data: {
                url: avatar.filename
            }
        }

    }

    /**
     * 个人基本资料修改
     */
    @Post('/user/profile')
    @Before(UserAuth)
    public async postProfile(@Ctx ctx: Context) {
        let body: any = ctx.request.body;
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
        let userProfile = await UserProfileModel.findOne({
            where: {userId: ctx.session.id}
        });

        // 如果用户传递过来了mobile，则修改
        mobile && userProfile.set('mobile', mobile);
        email && userProfile.set('email', email);
        realname && userProfile.set('realname', realname);
        gender && userProfile.set('gender', gender);
        // 注意：请求发送过来的年月日是字符串信息，数据库中存储的日期格式的，所以，我们需要把用户传递过来的日期字符串编程日期对象
        let d = new Date( userProfile.get('birthday') );
        year && d.setFullYear(year);
        month && d.setMonth(month - 1);  // 请求的时候发送的月份是从1开始计算
        date && d.setDate(date);
        userProfile.set('birthday', d);

        /**
         * 这是我犯的低级错误！！！
         */

        await userProfile.save();

        ctx.body = {
            code: 0,
            data: userProfile
        }

    }

    /**
     * 发布新菜谱接口
     */
    @Post('/user/publish')
    @Before(UserAuth)
    public async postPublish(@Ctx ctx: Context) {
        let body: any = ctx.request.body;

        let name = body.name || '';
        let categoryId = body.categoryId || 0;
        let covers = body.covers || [];
        let description = body.description || ''
        let craft = body.craft || '';
        let level = body.level || '';
        let taste = body.taste || '';
        let needTime = body.needTime || '';
        let cookers = body.cookers || [];
        let ingredients = body.ingredients || {m: [], s: []};
        let steps = body.steps || [];
        let tips = body.tips || '';

        if (!name) {
            return ctx.body = {
                code: 1,
                message: '菜谱名称不能为空'
            }
        }
        
        let cookbook = CookbookModel.build({
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
        }
    }

    /**
     * 修改
     */
    @Post('/user/cookbook/edit')
    @Before(UserAuth)
    public async postCookbookEdit(@Ctx ctx: Context) {
        let body: any = ctx.request.body;

        if (!body.name) {
            return ctx.body = {
                code: 1,
                message: '菜谱名称不能为空'
            }
        }
        
        let cookbook = await CookbookModel.findById(body.id);

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
        }
    }

    /**
     * 上传成品图
     */
    @Post('/user/publish/cover')
    @Before(UserAuth)
    public async postPublishCover(@RequestParam('cover', {file: true}) cover: MultipartFile, @Ctx ctx: Context) {

        // avatar存储的是上传成功以后的文件信息
        // console.log(cover);

        ctx.body = {
            code: 0,
            data: {
                url: cover.filename
            }
        }

    }
}