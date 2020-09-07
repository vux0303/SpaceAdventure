cc.Class({
    extends: cc.Component,

    properties: {
        scrollSpeed: 1,
        isVertical: true,
        _midPoint: cc.v2,
        _startPoint: cc.v2,
        _finishPoint: cc.v2,
        _bgFrameHolder1: cc.v2,
        _bgIdx1:0,
        _bgIdx2: 1,
        _bgFrameHolder2: cc.v2,
        _direction: cc.v2,
    },

    onLoad() {
        this._midPoint = cc.v2(0, 0);
        this._startPoint = cc.v2(this._midPoint.x + cc.winSize.width * !this.isVertical, this._midPoint.y + cc.winSize.height * this.isVertical);
        this._finishPoint = cc.v2(this._midPoint.x - cc.winSize.width * !this.isVertical, this._midPoint.y - cc.winSize.height * this.isVertical);

        this._direction = this.isVertical ? cc.v2(0, -1) : cc.v2(-1, 0);
    },

    start() {
        //tween isn't due to the need of manipulate speed
        let speed = this.node.getParent().getComponent("BackgroundMgr").scrollSpeed;
        if(speed){
            this.scrollSpeed = speed;
        }
        this._bgFrameHolder1 = cc.v2(this._midPoint);
        this._bgFrameHolder2 = cc.v2(this._startPoint);
    },

    update(dt) {
        this._bgFrameHolder1.add(this._direction.mul(this.scrollSpeed), this._bgFrameHolder1);
        this._bgFrameHolder2.add(this._direction.mul(this.scrollSpeed), this._bgFrameHolder2);

        this.node.children[this._bgIdx1].setPosition(this._bgFrameHolder1.x, this._bgFrameHolder1.y);
        this.node.children[this._bgIdx2].setPosition(this._bgFrameHolder2.x, this._bgFrameHolder2.y);

        if (this.isReachFinish(this._bgFrameHolder1)) {
            let passOver = this._bgFrameHolder1.sub(this._finishPoint);
            this._bgFrameHolder1.x = this._startPoint.x + passOver.x;
            this._bgFrameHolder1.y = this._startPoint.y + passOver.y;
            this._bgIdx1 += 2;
            if(this._bgIdx1 > this.node.childrenCount - 1){
                this._bgIdx1 = this._bgIdx1 % this.node.childrenCount;
            }
        } else if (this.isReachFinish(this._bgFrameHolder2)) {
            let passOver = this._bgFrameHolder2.sub(this._finishPoint);
            this._bgFrameHolder2.x = this._startPoint.x + passOver.x;
            this._bgFrameHolder2.y = this._startPoint.y + passOver.y;
            this._bgIdx2 += 2;
            if(this._bgIdx2 > this.node.childrenCount - 1){
                this._bgIdx2 =  this._bgIdx2 % this.node.childrenCount;
            }
        }
    },
    isReachFinish: function (v) {
        return this._finishPoint.sub(v).dot(this._direction) < 0;
    }
});
