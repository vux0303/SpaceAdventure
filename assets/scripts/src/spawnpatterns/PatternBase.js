var PatternBase = cc.Class({
    extends: cc.Component,

    properties: {
        _tweens: {
            default: [],
            type: [cc.Tween],
        },
        _numTotal: 0,
        _numEachSpawn: 0,

    },
    editor: {
        //disallowMultiple: true,
    },

    getTween: function (idx) {
        return this._tweens[idx].clone();
    },

    // tween: function(node, idx){
    //     return cc.tween(node).then(this._tweens[idx]).clone();
    // }
});

module.exports = PatternBase;
