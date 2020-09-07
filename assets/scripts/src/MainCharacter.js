const Gun = require("./guns/Gun");
const BulletBase = require("./bullets/BulletBase");
var Opponent;
const levelResult = require("./Enum").levelResult;

var MainCharacter = cc.Class({
    extends: cc.Component,

    properties: {
        _collider: cc.PolygonCollider,
        _currentTouch: cc.Vec2,
        _enabledMove: false,
        _threshold: {
            default: 10,
        },
        minShotInterval: 0.2,
        maxShotInterval: 0.6,
        shotIntervalStep: 0.1,
        _gun: null,
        _anim: null,
        moveSpeed: {
            default: 5,
            range: [1, 10, 1],
            tooltip:"movement speed"
        },
        maxHP: 6,
        currentHP: 6,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._collider = this.node.getComponent(cc.PolygonCollider);
        this._gun = this.node.getComponent(Gun);
        this._anim = this.node.getComponent(cc.Animation);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this._currentTouch = this.node.getPosition();
    },

    onTouchStart: function (touch, event) {
        let touchLoc = touch.getLocation();
        if (cc.Intersection.pointInPolygon(touchLoc, this._collider.world.points)) {
            this._enabledMove = true;
        }
        if (this._gun) {
            this._gun.autoFire();
        }
    },
    onTouchMove: function (touch, event) {
        if (this._enabledMove) {
            this._currentTouch = touch.getLocation();
        }
    },
    onTouchEnd:function(touch, event){
        if (this._gun) {
            this._gun.stop();
        }
    },
    onTouchCancel: function (touch, event) {
        this._currentTouch = this.node.getPosition();
        this._enabledMove = false;
        if (this._gun) {
            this._gun.stop();
        }
    },

    update(dt) {
        let direction = this._currentTouch.sub(this.node.getPosition());
        if (direction.len() > this._threshold) {
            this.node.x += direction.normalize().x * (100 + 25 * this.moveSpeed) * dt;
            this.node.y += direction.normalize().y * (100 + 25 * this.moveSpeed) * dt;
        }
    },

    upgradeGun:function(){
        this._gun.switchGun(this._gun.currentGunIdx + 1);
    },
    
    degradeGun:function(){
        this._gun.switchGun(this._gun.currentGunIdx - 1);
    },

    upgradeAttackSpeed: function(){
        if(this._gun.shotInterval - this.shotIntervalStep < this.minShotInterval){
            return;
        }
        this._gun.updateShotInterval(this._gun.shotInterval - this.shotIntervalStep);
    },

    degradeAttackSpeed:function(){
        if(this._gun.shotInterval + this.shotIntervalStep > this.maxShotInterval){
            return;
        }
        this._gun.updateShotInterval(this._gun.shotInterval + this.shotIntervalStep);
    },

    //death will start the scene
    // reset:function(){
    //     //bug? 2 schedule in 1 frame?
    //     this._gun.switchGun(0);
    //     this._gun.updateShotInterval(this._minShotIntervalStep);
    // },

    immunize:function(){
        this._collider.enabled = false;
        cc.tween(this.node).blink(2, 10).call(()=>{this._collider.enabled = true}).start();
    },

    takeDamage:function(dmg){
        this.currentHP -= dmg;
        if(this.currentHP > 0){
            this.immunize();
            this.degradeGun();
            this.degradeAttackSpeed();

            let event = new cc.Event.EventCustom("MCHealthChanged", true);
            event.setUserData(this.currentHP);
            this.node.dispatchEvent(event);
        }else{
            if(this._gun){
                this._gun.stop();
            }
            this._collider.enabled = false;
            this._anim.play("mcExplosionAnim");
        }
    },

    gainHealth:function(bonus){
        if(this.currentHP + bonus > this.maxHP){
            return;
        }
        this.currentHP++;
        let event = new cc.Event.EventCustom("MCHealthChanged", true);
        event.setUserData(this.currentHP);
        this.node.dispatchEvent(event);
    },
    onCollisionEnter: function(other, self){
        if(other.node.getComponent(BulletBase)){
            this.takeDamage(other.node.getComponent(BulletBase).damage);
            return;
        }
        if(other.node.getComponent(Opponent)){
            this.takeDamage(1);
            return;
        }
    },
    onExplosionFinish:function(){
        let event = new cc.Event.EventCustom("GameOver", true);
        event.setUserData({result: levelResult.lost});
        this.node.dispatchEvent(event);
        this.node.destroy();
    }
});

module.exports = MainCharacter;
Opponent = require("./Opponent");
