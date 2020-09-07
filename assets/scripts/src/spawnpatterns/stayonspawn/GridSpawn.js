const StayOnSpawn = require("./StayOnSpawn");

var launchIdx = cc.Enum({
    fromNearSide: 0,
    fromFarSide: 1,
    fromBehind: 2,
})

var groupIdx = cc.Enum({
    OneByOne: 0,
    Pair: 1,
    Half: 3,
    All: 4
})

cc.Class({
    extends: StayOnSpawn,

    properties: {
        _stopPoints: {
            default: [],
            type: [cc.Vec2],
        },
        offset: 150,
        row: {
            default: 0,
            displayName: "row",
            tooltip: "number of rows",
            step: 1
        },
        col: {
            default: 0,
            displayName: "column",
            tooltip: "number of columns",
            step: 1
        },
        rowDistance: 50,
        colDistance: 50,
        topMargin: 50,
        leftMargin: 50,
        launchOption: {
            default: launchIdx.fromNearSide,
            type: launchIdx
        },
        groupOption: {
            default: groupIdx.OneByOne,
            type: groupIdx
        },
        indexes: [cc.Integer]
    },

    onLoad() {
        this._super();
        this._numTotal = this.row * this.col;
        this._numEachSpawn = 1;
        this.initSpawnAmount();

        let i = 0;
        // for (i; i < this._numTotal; i++) {
        //     let endPoint = cc.v2(this.leftMargin + i % this.col * this.colDistance, cc.winSize.height - this.topMargin - Math.floor(i / this.col) * this.rowDistance);
        //     this._tweens.push(cc.tween().then(this.launch(endPoint)).then(this.fly(endPoint)));
        // }
        this.initStopPoints();
        for (i; i < this._numTotal; i++) {
            if (this.indexes.length > 0) {
                for (var idx of this.indexes) {
                    if (idx === i) {
                        this._tweens.push(cc.tween().then(this.launch(this._stopPoints[i])).then(this.fly(this._stopPoints[i])));
                    }
                }
            } else {
                this._tweens.push(cc.tween().then(this.launch(this._stopPoints[i])).then(this.fly(this._stopPoints[i])));
            }
        }

        if (this.indexes.length > 0) {
            this._numTotal = this.indexes.length;
        }
    },

    initStopPoints: function () {
        let i = 0;
        for (i; i < this._numTotal; i++) {
            this._stopPoints.push(cc.v2(this.leftMargin + i % this.col * this.colDistance, cc.winSize.height - this.topMargin - Math.floor(i / this.col) * this.rowDistance));
        }
        this._stopPoints.sort(function (a, b) { return Math.abs(a.x - cc.winSize.width / 2) - Math.abs(b.x - cc.winSize.width / 2) });
        //this._stopPoints.reverse();
    },
    initSpawnAmount: function () {
        if (this.groupOption == groupIdx.OneByOne) {
            this._numEachSpawn = 1;
        } else if (this.groupOption == groupIdx.Pair) {
            this._numEachSpawn = 2;
        } else if (this.groupOption == groupIdx.Half) {
            this._numEachSpawn = this._numTotal / 2;
        } else {
            this._numEachSpawn = this._numTotal;
        }
    },
    launch: function (endP) {
        //make another spawnpattern
        if (this.launchOption == launchIdx.fromBehind) {
            return cc.tween().call(this.disableColliderCB).set({ position: cc.v2(endP.x, -this.offset), color: new cc.Color(100, 100, 100) });
        }
        if ((endP.x >= cc.winSize.width / 2) ^ this.launchOption) {
            return cc.tween().set({ position: cc.v2(cc.winSize.width + this.offset, endP.y) });
        } else {
            return cc.tween().set({ position: cc.v2(-this.offset, endP.y) });
        }
    },
    fly: function (endP) {
        if (this.launchOption == launchIdx.fromBehind) {
            return cc.tween().to(2, { y: this.offset }).delay(2)
                .to(2, { y: cc.winSize.height + this.offset }).call(this.enableColliderCB)
                .set({ color: new cc.Color(255, 255, 255) }).by(0, { angle: 180 }).to(2, { y: endP.y });
        }
        return cc.tween().to(2, { position: endP });
    },
    disableColliderCB: function (target) {
        let collider = target.getComponent(cc.Collider);
        if (collider) {
            collider.enabled = false;
        }
    },
    enableColliderCB: function (target) {
        let collider = target.getComponent(cc.Collider);
        if (collider) {
            collider.enabled = true;
        }
    }
});
