import {Controller, Get, Ctx, Post} from 'koa-controllers';
import { Context } from 'koa';
import UserModel from '../../models/user';
import UserProfileModel from '../../models/user-profile';

@Controller
export class AdminUserController {

    @Get('/api/admin/user')
    public async index(@Ctx ctx: Context) {

        // 页码从1开始计算
        let page = Number(ctx.query.page) || 1;
        // 每页显示的记录条数
        let limit = 10;
        let offset = (page - 1) * limit;

        UserModel.hasOne(UserProfileModel);
        let users = await UserModel.findAndCountAll({
            // attributes: ['id', 'username']
            attributes: {
                exclude: ['password']
            },
            // 每次返回2条数据
            limit,
            // 记录数据的偏移值
            offset,
            include: [UserProfileModel]
        });

        users.rows = users.rows.map( (user: any) => {
            return Object.assign(user, {avatar: user.avatar === '' ? 'avatar.jpg' : user.avatar})
        } )

        ctx.body = {
            code: 0,
            data: {...users, limit, page}
        }

    }

    @Post('/api/admin/user/status')
    public async status(@Ctx ctx: Context) {
        let body = <any>ctx.request.body;
        let id = Number(body.id);

        // 根据id获取当前数据库中对应的用户
        let user = await UserModel.findById(id);

        // 如果没有该用户
        if (!user) {
            return ctx.body = {
                code: 1,
                message: '不存在该用户'
            }
        }

       user.set('disabled', !user.get('disabled'));
       await user.save();

       ctx.body = {
           code: 0,
           data: {
               id: user.get('id'),
               disabled: user.get('disabled')
           }
       }
    }

    @Post('/api/admin/user/profile')
    public async postProfile(@Ctx ctx: Context) {
        let body: any = ctx.request.body;
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
        let userProfile = await UserProfileModel.findOne({
            where: {userId: id}
        });

        // 如果用户传递过来了mobile，则修改
        mobile && userProfile.set('mobile', mobile);
        email && userProfile.set('email', email);
        realname && userProfile.set('realname', realname);
        gender && userProfile.set('gender', gender);

        let d = new Date( userProfile.get('birthday') );
        year && d.setFullYear(year);
        month && d.setMonth(month - 1);
        date && d.setDate(date);
        userProfile.set('birthday', d);

        await userProfile.save();

        ctx.body = {
            code: 0,
            data: userProfile
        }
    }

}