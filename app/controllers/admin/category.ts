import {Controller, Get, Ctx, Post} from 'koa-controllers';
import { Context } from 'koa';
import * as Sequelize from 'sequelize';
import CategoryModel from '../../models/category';
import Tree from '../../libs/Tree';

@Controller
export class AdminCategoryController {

    @Get('/api/admin/category')
    public async index( @Ctx ctx: Context ) {
        let categories = await CategoryModel.findAll();
        
        let data = categories.map( category => {
            return {
                id: category.get('id'),
                name: category.get('name'),
                pid: category.get('pid')
            }
        } );


        data = (new Tree(data)).getTree(0);

        ctx.body = {
            code: 0,
            data
        }
        
        
    }

    @Post('/api/admin/category/add')
    public async add( @Ctx ctx: Context ) {
        /**
         * 接收name和pid
         * 通过 ctx.request.body
         */
        let body = <any>ctx.request.body;
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

        let data = CategoryModel.build({
            name,pid
        });
        await data.save();

        ctx.body = {
            code: 0,
            data
        }
        
    }

    @Post('/api/admin/category/edit')
    public async edit( @Ctx ctx: Context ) {
        /**
         * 接收id和name
         */
        let body = <any>ctx.request.body;
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
        let data = await CategoryModel.findById(id);
        if (!data) {
            return ctx.body = {
                code: 2,
                message: '不存在该分类'
            }
        }
        data.set('name', name);
        await data.save();

        ctx.body = {
            code: 0,
            data
        }
        
    }

    @Post('/api/admin/category/remove')
    public async remove( @Ctx ctx: Context ) {
        /**
         * 接收id
         */
        let body = <any>ctx.request.body;
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
        await CategoryModel.destroy({
            where: {
                [Sequelize.Op.or]: [
                    {id: id},
                    {pid: id}
                ]
            }
        });

        ctx.body = {
            code: 0
        }
        
    }

}