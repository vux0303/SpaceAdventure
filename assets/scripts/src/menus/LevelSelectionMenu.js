var page = cc.Class({
    name: "page",
    properties: {
        title: "",
        avatar: cc.SpriteFrame,
    }
})

cc.Class({
    extends: cc.Component,
    properties: {
        levelMenu: cc.Node,
        pageInfos: {
            type: [page],
            default: [],
        },
        pageTemplate: cc.Prefab,
        playSF: cc.SpriteFrame,
        lockedSF: cc.SpriteFrame,
        commingSF: cc.SpriteFrame,
        goldenStarSF: cc.SpriteFrame,
    },

    onLoad() {
        let playerProfile = cc.find("GameMgr").getComponent("GameMgr").playerProfile;
        let len = this.pageInfos.length;
        let i = 0;
        for (i; i < len; i++) {
            let template = cc.instantiate(this.pageTemplate);
            let pageData = template.getComponent("LevelInfoPageTemplate");
            pageData.title.string = this.pageInfos[i].title;
            pageData.avatar.spriteFrame = this.pageInfos[i].avatar;
            if (i < playerProfile.currentLevel) {
                let clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node;
                clickEventHandler.component = "LevelSelectionMenu";
                clickEventHandler.handler = "onPlayBtnClick";
                clickEventHandler.customEventData = i + 1;

                pageData.levelState.getComponent(cc.Sprite).spriteFrame = this.playSF;
                pageData.levelState.getComponent(cc.Button).clickEvents.push(clickEventHandler);
            } else if (i === len - 1) {
                pageData.levelState.getComponent(cc.Sprite).spriteFrame = this.commingSF;
                pageData.levelState.getComponent(cc.Button).enabled = false;
            } else {
                pageData.levelState.getComponent(cc.Sprite).spriteFrame = this.lockedSF;
                pageData.levelState.getComponent(cc.Button).enabled = false;
            }
            pageData.setRanked(playerProfile.rank[i], this.goldenStarSF);
            this.levelMenu.getComponent(cc.PageView).content.width += template.width;
            this.levelMenu.getComponent(cc.PageView).addPage(template);
        }
    },
    onPlayBtnClick: function (event, customEventData) {
        cc.find("GameMgr").getComponent("GameMgr").loadSceneWithTransition("Level" + customEventData);
    },
    onPrevBtnCLick: function () {
        let currenIdx = this.levelMenu.getComponent(cc.PageView).getCurrentPageIndex();
        this.levelMenu.getComponent(cc.PageView).scrollToPage(currenIdx - 1);
    },
    onNextBtnClick: function () {
        let currenIdx = this.levelMenu.getComponent(cc.PageView).getCurrentPageIndex();
        this.levelMenu.getComponent(cc.PageView).scrollToPage(currenIdx + 1);
    },
    onBackBtnClick: function () {
        let gameMgr = cc.find('GameMgr').getComponent('GameMgr');
        gameMgr.loadSceneWithTransition("MainMenu");
    },
});
