const PatternBase = require("../PatternBase");
const Spawner = require("../../Spawner");

var FlyBySpawn = cc.Class({
    extends: PatternBase,

    properties: {
    },

    onLoad(){
        this._spawner = this.node.getComponent(Spawner);
        if(this._spawner){
            this._spawner.repeatOnFinishSpawning = true;
        }
    },
    getTween: function (idx) {
        return  cc.tween().call((target)=>{target.emit("ready")}).then(this._super(idx)).call((target)=>{target.emit("dead")});
    }
});

module.exports = FlyBySpawn;
