const BulletBase = require("./BulletBase");

cc.Class({
    extends: BulletBase,

    properties: {

    },

    onEnable() {
        this.direction = this.direction.normalize();
        this.node.angle = - cc.misc.radiansToDegrees(this.direction.signAngle(cc.v2(0, 1)));
    },

    update(dt) {
        if (this.isLost()) {
            this.node.cleanup();
            this._pool.put(this.node);
        }
        this.node.x += this.direction.x * (this._minSpeed + this._speedStep * this.speed) * dt;
        this.node.y += this.direction.y * (this._minSpeed + this._speedStep * this.speed) * dt;
    },
    isLost: function () {
        let pos = this.node.getPosition();
        return (pos.x < -this._offset
            || pos.x > cc.winSize.width + this._offset
            || pos.y < -this._offset
            || pos.y > cc.winSize.height + this._offset)
    }
});
