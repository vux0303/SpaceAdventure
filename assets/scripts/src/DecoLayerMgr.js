cc.Class({
    extends: cc.Component,

    properties: {
        firstSpawner: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.firstSpawner.getComponent("Spawner").launch();
    },

    // update (dt) {},
});
