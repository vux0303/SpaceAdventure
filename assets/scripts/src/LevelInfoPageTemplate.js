
cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        avatar: cc.Sprite,
        levelState: cc.Node,
        stars: [cc.Sprite]
    },

    setRanked: function (rank, golden) {
        if (!rank) {
            return;
        }
        let i = rank;
        while(i > 0){
            this.stars[i - 1].spriteFrame = golden;
            i--;
        }
    },

    setState:function (params) {
        
    }
});
