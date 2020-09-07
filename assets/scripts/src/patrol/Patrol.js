//////////////////////////////////////////////////////////////////////////////
var PatrolBase = cc.Class({
    name: "PatrolBase",
    properties: {
        range: 10,
        duration: 1,
    },
    // copy: function (other) {
    //     this.range = other.range;
    //     this.duration = other.duration;

    // }
})

var HorizontalPatrol = cc.Class({
    name: "HorizontalPatrol",
    extends: PatrolBase,
    properties:{
        direction: 0,
    },
    tween: function () {
        let output = cc.tween();
        let factor = 1;
        if(this.direction===0){
            output = output.by(this.duration, { position: cc.v2(-this.range / 2, 0) }, { easing: 'sineOut' });
        }else{
            factor = this.direction / Math.abs(this.direction);
        }
        return output.repeatForever(
                 cc.tween().by(this.duration * 2, { position: cc.v2(factor * this.range, 0) }, { easing: 'sineInOut' })
                .by(this.duration * 2, { position: cc.v2(-factor * this.range, 0) }, { easing: 'sineInOut' })
        );

    },
})

var TrianglePatrol = cc.Class({
    name: "TrianglePatrol",
    extends: PatrolBase,
    properties: {
        angle: 0,
        clockwise: false,
    },

    tween: function () {
        let p1 = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-30 + this.angle)).mulSelf(this.range);
        let p2 = this.clockwise ? p1.rotate(-Math.PI * 2 / 3) : p1.rotate(Math.PI * 2 / 3);
        let p3 = this.clockwise ? p2.rotate(-Math.PI * 2 / 3) : p2.rotate(Math.PI * 2 / 3);
        return cc.tween().repeatForever(cc.tween().by(this.duration / 3, { position: p1 })
            .by(this.duration / 3, { position: p2 })
            .by(this.duration / 3, { position: p3 }));
    },
})

var SelfRotatePatrol = cc.Class({
    name: "SelfRotatePatrol",
    extends:PatrolBase,
    properties:{
        range:{
            default: 0,
            visible: false,
            override: true,
        },
        duration:{
            default: 0,
            range:[1, 10 ,1],
            displayName: "speed", //use as speed
            override: true,
        },
        clockwise: false,
    },
    tween:function(){
        return cc.tween().repeatForever(cc.tween().by(0.1, {angle: this.duration * 5}));
    }
})

var CircularPatrol = cc.Class({
    name: "CircularPatrol",
    extends: PatrolBase,
    tween:function(){
        return cc.tween().repeatForever(
                cc.tween().parallel(
                    cc.tween().by(this.duration, {x: -this.range*2 }, {easing: "sineInOut"}),
                    cc.tween().by(this.duration/2, {y: this.range},{easing:"sineOut"}).by(this.duration/2, {y: -this.range}, {easing:"sineIn"})
                ).parallel(
                    cc.tween().by(this.duration, {x: this.range*2 }, {easing: "sineInOut"}),
                    cc.tween().by(this.duration/2, {y: -this.range}, {easing:"sineOut"}).by(this.duration/2, {y: this.range}, {easing:"sineIn"})
                )
        );
    }
})

//////////////////////////////////////////////////////////////////////

var patrolIdx = cc.Enum({
    horizontalPatrol: 0,
    trianglePatrol: 1,
    selfRotatePatrol: 2,
    circularPatrol: 3,
})


var patrolMap = [
    HorizontalPatrol,
    TrianglePatrol,
    SelfRotatePatrol,
    CircularPatrol,
]
////////////////////////////////////////////////////////////////////////

var Patrol = cc.Class({
    extends: cc.Component,

    properties: {
        patrolOption: {
            default: patrolIdx.horizontalPatrol,
            type: patrolIdx,
            notify: function () {
                this.patrol = new patrolMap[this.patrolOption];
            }
        },
        patrol: {
            default: null,
            type: PatrolBase,
            notify: function () {
                if (this.patrol && this.patrol.constructor.name == "PatrolBase") {
                    this.patrol = new patrolMap[this.patrolOption];
                }
            }
        },
    },
    onLoad() {
        this.node.on("ready", this.onReady.bind(this));
    },
    copy: function (other) {
        if(!other){
            this.enabled = false;
            return;
        }
        this.enabled = true;
        this.patrol = other.patrol;
    },
    onReady: function () {
        if (this.enabled) {
            cc.tween(this.node).then(this.patrol.tween()).start(); //so tween.clone? seem promise
        }
    }
});
module.exports = Patrol;