
///////////////////////////////////////////////////////////////
// SORT OBJECT//

const Utils = require("../../Utils");
const FlyBySpawn = require("./FlyBySpawn");

///////////////////////////////////////////////////////////////
var launchIdx = cc.Enum({
    leftToRight: 0,
    rightToLeft: 1,
    random: 4,
})

var DropdownOrder = cc.Class({
    name: "DropdownOrder",
    statics: {
        leftToRight: function (points) {

        },

        rightToLeft: function (points) {
            points.reverse();
        },

        random: function (points) {
            points.sort(function (a, b) { return 0.5 - Math.random() });
        },
    },
});

var launchMap = [
    DropdownOrder.leftToRight,
    DropdownOrder.rightToLeft,
    DropdownOrder.centerToSides,
    DropdownOrder.sidesToCenter,
    DropdownOrder.random
]

//////////////////////////////////////////////////////////////////////
//Flypaths
//////////////////////////////////////////////////////////////////////

var flyPathIdx = cc.Enum({
    straight: 0,
    plannet: 1,
    randomDirection: 2,
    randomBezier: 3,
    wave: 4,
})

var FlyPathBase = cc.Class({
    name: "FlyPathBase",
    properties: {
        speed: {
            default: 6,
            range: [1, 10, 1],
            slide: true,
        },
        offset: 100,
    }
})

var StraightFlyPath = cc.Class({
    name: "StraightFlyPath",
    extends: FlyPathBase,
    tween: function () {
        return cc.tween().by(11 - this.speed, { position: cc.v2(0, - cc.winSize.height - this.offset * 2) });
    }
})

var PlannetFlyPath = cc.Class({
    name: "PlannetFlyPath",
    extends: FlyPathBase,
    tween: function () {
        return cc.tween().parallel(
            cc.tween().by(70 - this.speed * 5, { position: cc.v2(0, - cc.winSize.height - this.offset * 2) }),
            cc.tween().by((70 - this.speed * 5) * 2 / 3, { scale: 0.3 }).by((70 - this.speed * 5) * 1 / 3, { scale: -0.1 })
        );
    }
})

var RandomDirection = cc.Class({
    name: "RandomDirection",
    extends: FlyPathBase,
    tween: function () {
        return cc.tween().to(11 - this.speed, { position: cc.v2(Utils.getRndInterger(-200, cc.winSize.width + 200), - cc.winSize.height - this.offset * 2) });
    }
})

var RandomBezier = cc.Class({
    name: "RandomBezier",
    extends: FlyPathBase,
    tween: function () {
        return cc.tween().bezierTo((11 - this.speed) / 2, cc.v2(cc.winSize.width + 100, cc.winSize.height * 1 / 3),
            cc.v2(cc.winSize.width - 100, cc.winSize.height * 3 / 5),
            cc.v2(cc.winSize.width / 2, cc.winSize.height * 2 / 3))
            .bezierTo((11 - this.speed), cc.v2(0, cc.winSize.height * 3 / 4),
                cc.v2(-100, cc.winSize.height * 1 / 3),
                cc.v2(cc.winSize.width * 2, - cc.winSize.height - this.offset));
    }
})
var Wave = cc.Class({
    name: "Wave",
    extends: FlyPathBase,
    properties: {
        range: 200,
        duration: 1,
    },
    tween: function () {
        return cc.tween().call((target) => {
                                cc.tween(target).by(this.duration, { x: this.range / 2 }, { easing: 'sineOut' })
                                                .repeatForever(
                                                    cc.tween().by(this.duration * 2, { x: -this.range }, { easing: 'sineInOut' })
                                                        .by(this.duration * 2, { x: this.range }, { easing: 'sineInOut' })
                                                ).start();
                        }, this).by(11 - this.speed, { y: - cc.winSize.height - this.offset * 2 });
    }
})

var flyPathMap = [
    StraightFlyPath,
    PlannetFlyPath,
    RandomDirection,
    RandomBezier,
    Wave
]

///////////////////////////////////////////////////////////////////////////////////////////////////

var DropdownSpawn = cc.Class({
    extends: FlyBySpawn,

    properties: {
        _startPoints: [cc.Vec2],
        //_applyLaunchOption: [cc.Integer],
        _offset: 150,
        startPointNum: {
            default: 0,
            displayName: "Number of start points",
            tooltip: "Number of start points. Place on top of screen with equal distance between points base on chosen numer",
        },
        launchOption: {
            default: launchIdx.leftToRight,
            type: launchIdx,
        },
        flyPathOption: {
            default: flyPathIdx.straight,
            type: flyPathIdx,
            notify: function () {
                this.flyPath = new flyPathMap[this.flyPathOption];
            }
        },
        flyPath: {
            default: null,
            type: FlyPathBase,
            notify: function () {
                if (this.flyPath && this.flyPath.constructor.name == "FlyPathBase") {
                    this.flyPath = new flyPathMap[this.flyPathOption];
                }
            }
        },
    },


    onLoad() {
        this._super();
        this._offset = this.flyPath.offset;
        this._numTotal = this.startPointNum;
        this._numEachSpawn = 1;

        this.initStartPoints();
        launchMap[this.launchOption](this._startPoints);
        this.initTweens();
    },
    initTweens: function () {
        for (let i = 0; i < this._numTotal; i++) {
            this._tweens.push(cc.tween().then(this.launch(i)).then(this.flyPath.tween()));
        }
    },
    initStartPoints: function () {
        let distance = cc.winSize.width / (this.startPointNum + 1);
        for (let i = 0; i < this.startPointNum; i++) {
            this._startPoints.push(cc.v2((i + 1) * distance, cc.winSize.height + this._offset));
        }
    },
    launch(idx) {
        return cc.tween().to(0, { position: this._startPoints[idx] });
    },
});

