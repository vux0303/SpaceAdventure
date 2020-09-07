const GunBase = require("./GunBase");
const BulletBase = require("../bullets/BulletBase");


var MultiDirectionGun = cc.Class({
    name: "MultiDirectionGun",
    extends: GunBase,

    properties: {
        spreadLine: 4,
        spreadAngle: 10,
    },

    init: function () {
        this._super();
    },

    fire: function (barrelPos, direction) {
        if (!this._pool) {
            return;
        }
        let bullet;
        let startAngle = (this.spreadLine - 1) * this.spreadAngle / 2;
        let startDirection = direction.rotate(cc.misc.degreesToRadians(startAngle));
        let i = 0;
        for (i; i < this.spreadLine; i++) {
            if (this._pool.size() === 0) {
                bullet = cc.instantiate(this.bullet);
            } else {
                bullet = this._pool.get(this.bullet);
            }
            bullet.x = barrelPos.x;
            bullet.y = barrelPos.y;

            bullet.getComponent(BulletBase).direction = startDirection.rotate(cc.misc.degreesToRadians(-this.spreadAngle * i));
            bullet.getComponent(BulletBase).damage = this.damage;
            bullet.getComponent(BulletBase).speed = this.speed;
            bullet.getComponent(BulletBase)._pool = this._pool;
            if(bullet.getComponent(BulletBase).hasOwnProperty('target')){
                bullet.getComponent(BulletBase).target = this.target;
            }

            this._gameplayMgr.node.addChild(bullet);
        }
    },

    // update (dt) {},
});

module.exports = MultiDirectionGun;
