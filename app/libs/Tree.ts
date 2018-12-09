export default class Tree {

    private originData: any[] = [];

    constructor(data: any[]) {
        this.originData = data;
    }

    /**
     * 获取originData的tree形式
     * 
     * getTree(0)   => 把pid为0的所有数据找出来
     */
    getTree(id: number) {
        let _data: any[] = this.originData.filter( item => item.pid == id );

        _data.forEach( d => {
            d.children = this.getTree(d.id);
        } );

        return _data;
    }

}