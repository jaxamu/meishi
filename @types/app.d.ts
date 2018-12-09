import * as Koa from 'koa';
import * as nunjucks from 'nunjucks';

declare module 'koa' {

    /**
     * 扩展koa模块的Context接口
     */
    interface Context {
        params: any;
        template: nunjucks.Environment;
    }

}
