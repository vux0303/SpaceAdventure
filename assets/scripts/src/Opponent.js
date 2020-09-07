const Patrol = require("./patrol/Patrol");
const Gun = require("./guns/Gun");
const BulletBase = require("./bullets/BulletBase");
var MainCharacter;

var Opponent = cc.Class({
    extends: cc.Component,

    properties: {
        HP: 0,
        isAimPlayer: {
          default: false,
          notify:function(){
              if(!this.isAimPlayer){
                  this.target = null;
              }
          }  
        },
        target: {
            default: null,
            type: cc.Node,
            visible: function () { return this.isAimPlayer }
        },
        _ready: false,
        _gun: null,
        _animn: null,
        _isShootDown: false,
    },

    onLoad() {
        this._anim = this.node.getComponent(cc.Animation);

        this._gun = this.node.getComponent(Gun);

        this.node.on("ready", this.onReady.bind(this));
        this.node.on("retreat", this.onRetreat.bind(this));
        this.node.on("dead", this.blowUp.bind(this));
    },
    start() {
        if (this._anim) {
            this._anim.play();
        }
    },
    reuse(proto) {
        this.node.angle = proto.angle;
        this.node.scale = proto.scale;
        this.node.opacity = proto.opacity;
        this.node.getComponent(cc.Collider).enabled = true;
        this.copy(proto.getComponent(this.constructor));

        if(this.node.getComponent(Patrol)){
            this.node.getComponent(Patrol).copy(proto.getComponent(Patrol));
        }
        if(this.node.getComponent(Gun)){
            this.node.getComponent(Gun).copy(proto.getComponent(Gun));
        }
    },

    update(dt) {
        if (this.isAimPlayer && this._ready && this.target) {
            let targetDir = this.target.getPosition().sub(this.node.getPosition());
            let faceDir = this.node.convertToWorldSpaceAR(cc.v2(0, 1)).sub(this.node.getPosition());
            let angle = cc.misc.radiansToDegrees(faceDir.signAngle(targetDir));
            if(Math.abs(this.node.angle - angle) > 5){
                this.node.angle += (angle / Math.abs(angle));
            }
        }
    },
    copy: function (other) {
        if (this._anim) {
            this._anim.play();
        }
        this.HP = other.HP;
        this.isAimPlayer = other.isAimPlayer;
        this.target = other.target;
        this._isShootDown = false;
    },
    unuse() {
        //move to spawn point
        this.node.x = -50;
        this.node.y = -50;
        //this._anim.stop();
    },
    onReady: function () {
        this._ready = true;
        if (this._gun) {
            this._gun.autoFire();
        }
    },
    onRetreat: function () {
        if (this._gun) {
            this._gun.stop();
        }
    },
    takeDamage:function(damage){
        this.HP -= damage;
        if(this.HP <= 0){
            this._isShootDown = true;
            this.blowUp();
            this.HP = 100; //when collide with 2 bullet on frame that cause death.
        }
    },
    blowUp:function(){
        this.node.cleanup();
        this.ready = false;
        if (this._gun) {
            this._gun.stop();
        }
        this.node.getComponent(cc.Collider).enabled = false;
        if(this._anim){
            this._anim.play(this._anim._clips[1].name);
        }else{
            let event = new cc.Event.EventCustom("ExploisionFinish", true);
            this.node.dispatchEvent(event);
        }
        

        let event = new cc.Event.EventCustom("OpponentDown", true);
        event.setUserData({isShootDown: this._isShootDown/*, coin? */});
        this.node.dispatchEvent(event);
    },
    onCollisionEnter: function (other, self) {
        if(other.node.getComponent(BulletBase)){
            this.takeDamage(other.node.getComponent(BulletBase).damage);
            return;
        }
        if(other.node.getComponent(MainCharacter)){ 
            this._isShootDown = true;
            this.blowUp();
        }
    },
    onExploisionFinish(){
        let event = new cc.Event.EventCustom("ExploisionFinish", true);
        this.node.dispatchEvent(event);
    }
});

module.exports = Opponent;
MainCharacter = require("./MainCharacter");