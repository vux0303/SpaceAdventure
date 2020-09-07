const RetreatBase = require("./RetreatBase");

cc.Class({
    extends: RetreatBase,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    tween: function (node) {
        if (node.x < cc.winSize.width / 2) {
            return cc.tween(node).by(3, { position: cc.v2(-cc.winSize.width / 2 - 100, -cc.winSize.height / 4), scale: -0.1, opacity: -200 }, { easing: 'sineIn' });
        }
        else {
            return cc.tween(node).by(3, { position: cc.v2(cc.winSize.width / 2 + 100, -cc.winSize.height / 4), scale: -0.1, opacity: -200 }, { easing: 'sineIn' });
        }
    }
});
