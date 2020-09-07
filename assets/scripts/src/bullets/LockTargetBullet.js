const BulletBase = require("./BulletBase");

cc.Class({
    extends: BulletBase,

    properties: {
        duration: 5,
        turnRate: 1,
        target: cc.Node,
        _anim: null,
        _isDead: false,
    },

    onLoad() {
        this._anim = this.node.getComponent(cc.Animation);
        this._offset = 400;
    },

    onEnable() {
        if (this._anim) {
            this._anim.play();
        }
        this.direction = this.direction.normalize();
        this.node.angle = - cc.misc.radiansToDegrees(this.direction.signAngle(cc.v2(0, 1)));
        this.scheduleOnce(this.onTimeOut, this.duration);
    },
    onTimeOut: function () {
        this.blowUp();
    },
    update(dt) {
        let targetDir;
        let angle;
        let rotateAngle;
        if (this.isLost()) {
            this.unscheduleAllCallbacks();
            this._pool.put(this.node);
        }
        if (!this._isDead && this.target) {
            targetDir = this.target.getPosition().sub(this.node.getPosition());
            angle = cc.misc.radiansToDegrees(this.direction.signAngle(targetDir));
            if (Math.abs(angle) > 2) {
                rotateAngle = angle / Math.abs(angle) * this.turnRate;
                this.node.angle += rotateAngle;
                this.direction = this.direction.rotate(cc.misc.degreesToRadians(rotateAngle));
            }
            this.node.x += this.direction.x * (this._minSpeed + this._speedStep * this.speed) * dt;
            this.node.y += this.direction.y * (this._minSpeed + this._speedStep * this.speed) * dt;
        }
    },
    isLost: function () {
        let pos = this.node.getPosition();
        return (pos.x < -this._offset
            || pos.x > cc.winSize.width + this._offset
            || pos.y < -this._offset
            || pos.y > cc.winSize.height + this._offset)
    },
    onCollisionEnter: function (other, self) {
        if (other.node.getComponent(BulletBase)) {
            return;
        }
        this.blowUp();
    },
    blowUp: function () {
        this._isDead = true;
        this.unscheduleAllCallbacks();
        this.node.getComponent(cc.Collider).enabled = false;
        this._anim.play(this._anim._clips[1].name);
    },
    onExplosionFinish: function () {
        this._pool.put(this.node);
    },
    unuse() {
        this._super();
        this.node.getComponent(cc.Collider).enabled = true;
        this._isDead = false;
    }
});
