const BulletBase = require("../bullets/BulletBase");

var GunBase = cc.Class({
    name: "GunBase",
    properties: {
        _pool: {
            default: null,
            type: cc.NodePool
        },
        _gameplayMgr: null,
        bullet: {
            default: null,
            type: cc.Prefab,
            notify: function () {
                if (!this.bullet) {
                    this.target = null;
                }
            }
        },
        target: {
            default: null,
            type: cc.Node,
            visible: function () { return this.bullet && this.bullet.data.getComponent(BulletBase).hasOwnProperty('target') }
        },
        shotPoints: {
            default: [],
            type: [cc.Vec2],
            tooltip: "relative to each gun barrel by world position, use for multi shot. (0,0) will fire bullets at gun barrel position"
        },
        damage: 1,
        speed: {
            default: 5,
            range: [1, 10, 1]
        },
    },
    init() {
        this._gameplayMgr = cc.find("Canvas/GameplayLayer").getComponent("GameplayMgr");
        this._pool = this._gameplayMgr.getPool(this.bullet.data.name);
    },
    // copy:function(other){
    //     this._pool = other._pool;
    //     this._gameplayMgr = other._gameplayMgr;
    //     this.bullet = other.bullet;
    //     this.damage = other.damage;
    //     this.speed = other.speed;
    // }
})
module.exports = GunBase;
