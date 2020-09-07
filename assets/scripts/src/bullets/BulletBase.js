var BulletBase = cc.Class({
    extends: cc.Component,

    properties: {
        direction: cc.Vec2,
        damage: 1,
        speed: 1,
        _minSpeed: 100,
        _speedStep:50,
        _offset: 25,
        _pool: {
            default: null,
            type: cc.NodePool,
        }
    },
    unuse(){
        this.node.x = -50;
        this.node.y = -50;
    },

    onCollisionEnter: function(other, self){
        if(other.node.getComponent(BulletBase)){
            return;
        }
        this.node.cleanup();
        this._pool.put(this.node);
    },
});

module.exports = BulletBase;