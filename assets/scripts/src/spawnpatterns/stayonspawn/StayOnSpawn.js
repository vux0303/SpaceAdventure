const PatternBase = require("../PatternBase");
const Spawner = require("../../Spawner");

var StayOnSpawn = cc.Class({
    extends: PatternBase,

    properties: {
        isSyncAttack: {
            default: true,
            displayName: " Sync Attack",
            tooltip: "Whether a spawn object attack when it's in position or the pattern completed"
        },
        _inPositionTargets: [],
        _lastUnitId: null,
        _spawner: null,
        _deathCount: 0,
    },
    onLoad() {
        this._spawner = this.node.getComponent(Spawner);
        this.node.on("OpponentDown", this.onOpponentDown, this);
    },
    getTween: function (idx) {
        let baseTween = this._super(idx);
        if (this.isSyncAttack) {
            if (idx == this._numTotal - 1) {
                return cc.tween().call((target) => { this._lastUnitId = target._id }).then(baseTween).call(this.onTargetReached.bind(this));
            } else {
                return baseTween.call(this.onTargetReached.bind(this));
            }
        } else {
            return baseTween.call((target) => { target.emit("ready") });
        }
    },
    onTargetReached: function (target) {
        this._inPositionTargets.push(target);
        if (this._inPositionTargets.length == this._numTotal - this._deathCount) {
            this.Attack();
        }
    },
    onOpponentDown: function (event) {
        let isLastUnitInPosition = this._inPositionTargets.find(ele => ele._id == this._lastUnitId);
        this._inPositionTargets = this._inPositionTargets.filter(ele => ele._id != event.target._id) //use id?
        this._deathCount++;
        if (event.target._id == this._lastUnitId & !isLastUnitInPosition) {//so the last unit is dead on the way
            if (this._inPositionTargets.length == this._numTotal - this._deathCount) {
                this.Attack();
            }
        }
    },
    Attack: function () {
        for (let target of this._inPositionTargets) {
            if (target._activeInHierarchy) {
                target.emit("ready");
            }
        }
    }
});

module.exports = StayOnSpawn;