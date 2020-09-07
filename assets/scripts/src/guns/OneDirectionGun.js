const GunBase = require("./GunBase");
const BulletBase = require("../bullets/BulletBase");

var OneDirectionGun = cc.Class({
    name: "OneDirectionGun", //OneDirectionBullet
    extends: GunBase,

    init() {
        this._super();
    },

    fire: function (barrelPos, direction) {
        if (!this._pool) {
            cc.warn("no bullet pool are found");
            return;
        }
        let bullet;
        for (let p of this.shotPoints) {
            if (this._pool.size() === 0) {
                bullet = cc.instantiate(this.bullet);
            } else {
                bullet = this._pool.get(this.bullet);
            }
            bullet.x = barrelPos.x + p.x;
            bullet.y = barrelPos.y + p.y;
            let test = bullet.getComponent(BulletBase);
            bullet.getComponent(BulletBase).direction = direction;
            bullet.getComponent(BulletBase).damage = this.damage;
            bullet.getComponent(BulletBase).speed = this.speed;
            bullet.getComponent(BulletBase)._pool = this._pool;
            if (bullet.getComponent(BulletBase).hasOwnProperty('target')) {
                bullet.getComponent(BulletBase).target = this.target;
            }

            this._gameplayMgr.node.addChild(bullet);
        }
    },
});

module.exports = OneDirectionGun;
