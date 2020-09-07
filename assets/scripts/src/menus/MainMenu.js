cc.Class({
    extends: cc.Component,

    properties: {
    },

    onBtnStartClick:function(){
        let gameMgr = cc.find('GameMgr').getComponent('GameMgr');
        gameMgr.loadSceneWithTransition("LevelSelectionMenu");
    }
});
