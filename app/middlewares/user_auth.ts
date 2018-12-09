import {Middleware} from 'koa-controllers';

export default class UserAuth implements Middleware {

    async middleware(ctx: any, next: any) {
        // 判断当前用户是否登录
        if (ctx.session.id) {
            await next();
        } else {
            // 因为请求可以通过浏览器发送，也可以通过ajax调用
            // 如果是页面请求，那么就跳转到登录页面
            if ( ctx.headers['x-requested-with'] === 'XMLHttpRequest' ) {
                ctx.body = {
                    code: 1,
                    message: '你还没有登录'
                }
            } else {
                // 如果是ajax请求，返回一个json格式的数据
                ctx.redirect('/user/login');
            }
            
        }
    }

}