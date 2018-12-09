"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tree {
    constructor(data) {
        this.originData = [];
        this.originData = data;
    }
    /**
     * 获取originData的tree形式
     *
     * getTree(0)   => 把pid为0的所有数据找出来
     */
    getTree(id) {
        let _data = this.originData.filter(item => item.pid == id);
        _data.forEach(d => {
            d.children = this.getTree(d.id);
        });
        return _data;
    }
}
exports.default = Tree;
