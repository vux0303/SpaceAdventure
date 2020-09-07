const GunBase = require("./GunBase");
const OneDirectionGun = require("./OneDirectionGun");
const MultiDirectionGun = require("./MultiDirectionGun");
const Utils = require("../Utils");

var gunIdx = cc.Enum({
    OneDirectionGun: 0,
    MultiDirectionGun: 1,
    
})

var gunMap = [
    OneDirectionGun,
    MultiDirectionGun
]

var GunData = cc.Class({
    name: "GunData",
    properties: {
        gunOption: {
            default: gunIdx.OneDirectionGun,
            type: gunIdx,
            notify: function () {
                if (this.gunOption != gunIdx.none) {
                    this.gun = new gunMap[this.gunOption];
                }
            },
        },
        gun: {
            default: null,
            type: GunBase,
            notify: function () {
                if (this.gun && this.gun.constructor.name == "GunBase") {
                    this.gun = new gunMap[this.gunOption];
                }
            }
        },
    }
})

var Gun = cc.Class({
    extends: cc.Component,

    properties: {
        gunBarrelPosition: {
            default: [],
            type: [cc.Vec2],
            tooltip: "local gun barrel positions, use along with node's anchor to calculate directions"
        },
        isRandomShotInterval: {
            default: false,
        },
        shotInterval: {
            default: 0.2,
            visible: function(){return !this.isRandomShotInterval}
        },
        currentGunIdx: 0,
        gunList: {
            default: [],
            type: [GunData]
        },
    },
    onLoad() {
        for (let gunData of this.gunList) {
            gunData.gun.init();
        }
    },
    copy: function (other) {
        this.gunList = other.gunList;
        this.gunBarrelPosition = other.gunBarrelPosition;
        this.shotInterval = other.shotInterval;
        this.isRandomShotInterval = other.isRandomShotInterval;

    },
    fire: function () {
        let direction;
        for (let pos of this.gunBarrelPosition) {
            direction = this.node.convertToWorldSpaceAR(pos).sub(this.node.getPosition()); //always?
            this.gunList[this.currentGunIdx].gun.fire(this.node.convertToWorldSpaceAR(pos), direction);
        }
        if(this.isRandomShotInterval){
            this.autoFire();
        }
    },
    autoFire: function () {
        if (this.enabled) {
            if(this.isRandomShotInterval){
                this.unschedule(this.fire);
                this.schedule(this.fire, Math.random()*3);
            }
            else{
                this.schedule(this.fire, this.shotInterval, cc.macro.REPEAT_FOREVER, 0);
            }
        }
    },
    stop: function () {
        this.unschedule(this.fire);
    },
    switchGun: function (gunIdx) {
        if(gunIdx < 0 || gunIdx > this.gunList.length - 1){
            return;
        }
        this.currentGunIdx = gunIdx;
        if(cc.director.getScheduler().isScheduled(this.fire, this)){
            this.autoFire();
        };
    },
    updateShotInterval: function(newShotInterval){
        if(newShotInterval > 0){
            this.shotInterval = newShotInterval;
            if(cc.director.getScheduler().isScheduled(this.fire, this)){
                this.autoFire();
            };
        }
    }
})
module.exports = Gun;
