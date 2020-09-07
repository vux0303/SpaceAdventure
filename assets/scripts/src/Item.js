const MainCharacter = require("./MainCharacter");

const award = require("./Enum").award;

var test = Object.assign({}, award);

var Item = cc.Class({
    extends: cc.Component,

    properties: {
        dropSpeed: 1,
        type: {
            default: award.heal,
            type: award
        },
        _minSpeed: 100,
        _speedStep: 50,
        _offset: 150
    },

    update(dt) {
        if (this.isLost()) {
            this.node.destroy();
        }
        this.node.y += -1 * (this._minSpeed + this._speedStep * this.dropSpeed) * dt;
    },
    isLost: function () {
        let pos = this.node.getPosition();
        return (pos.x < -this._offset
            || pos.y < -this._offset
            || pos.y > cc.winSize.height + this._offset)
    },

    onCollisionEnter: function(other, self){
        if(this.type == award.heal){
            other.node.getComponent(MainCharacter).gainHealth(1);
        }else if(this.type == award.upgrade){
            other.node.getComponent(MainCharacter).upgradeGun();
        }else{
            other.node.getComponent(MainCharacter).upgradeAttackSpeed();
        }
        this.node.destroy();
    }
});

module.exports = Item;
