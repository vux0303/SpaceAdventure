const levelResult = require("../Enum").levelResult;

cc.Class({

    extends: cc.Component,

    properties: {
        title: cc.Label,
        hpLabel: cc.Label,
        pausedBtn: cc.Node,
        resumeBtn: cc.Node,
        restartBtn: cc.Node,
        menuBtn: cc.Node,
        stars: [cc.Node],
        goldenStarSP: cc.SpriteFrame,
        silverStarSP: cc.SpriteFrame,
    },

    onLoad () {
        this.hpLabel.string = cc.find("Canvas/GameplayLayer/MainCharacter").getComponent("MainCharacter").currentHP;
        this.node.on("GameOver", this.onGameOVer, this);
        this.node.on("MCHealthChanged", this.onMCHealthChanged, this);
        this.node.active = false;
    },

    onPauseBtnClick: function(){
        cc.director.pause();
        this.node.active = true;
        this.resumeBtn.active = true;
        this.title.string = "Paused";
    },

    onResumeBtnClick: function(){
        this.resumeBtn.active = false;
        this.node.active = false;
        cc.director.resume();
    },
    onRestartBtnClick: function(){
        let currentScene = cc.director.getScene();
        let gameMgr = cc.find('GameMgr').getComponent('GameMgr');
        gameMgr.loadSceneWithTransition(currentScene.name);
    },
    onMenuBtnClick: function(){
        cc.director.resume();
        let gameMgr = cc.find('GameMgr').getComponent('GameMgr');
        gameMgr.loadSceneWithTransition("LevelSelectionMenu");
    },
    onMCHealthChanged:function(currentHP){
            this.hpLabel.string = '' + currentHP;
    },
    onGameOVer:function(result, ranked){
        this.hpLabel.string = '' + 0;
        if(result == levelResult.lost){
            this.showGameOver();
        }else{
            this.showVitory(ranked);
        }
    },
    showGameOver: function(){
        this.pausedBtn.getComponent(cc.Button).enabled = false;
        this.node.active = true;
        this.restartBtn.active = true;
        this.title.string = "Defeated";
        cc.tween(this.title.node).to(0, {scale: 2.5})
                                    .to(1, {scale: 1},{easing: 'expoIn'}).start();
        
    },
    showVitory:function(ranked){
        this.pausedBtn.getComponent(cc.Button).enabled = false;
        this.node.active = true;
        this.restartBtn.active = true;
        this.title.string = "Victory";
        this.title.node.opacity = 0;
        this.title.node.color = new cc.Color(255, 255, 100);
        cc.tween(this.title.node).to(1, {opacity: 255},{easing: 'expoIn'}).start();

        let i = 0;
        for(i; i < 3; i++){
            if(i < ranked){
                this.stars[i].getComponent(cc.Sprite).spriteFrame = this.goldenStarSP;
            }else{
                this.stars[i].getComponent(cc.Sprite).spriteFrame = this.silverStarSP;
            }
            this.stars[i].scale = 0;
            cc.tween(this.stars[i]).delay(0.5*i).to(0.5, {scale: 1},{easing: 'expoIn'}).start();
            
        }
    }
});
