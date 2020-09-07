var PlayerProfile = cc.Class({
    name: "PlayerProfile",
    properties: {
        currentLevel: 0,
        rank: [cc.Interger],
    }
})


cc.Class({
    extends: cc.Component,

    properties: {
        _isProfileLoaded: false,
        playerProfile: {
            type: PlayerProfile,
            default: null,
        }
    },
    onLoad() {
        cc.game.addPersistRootNode(this.node);
        if (!this._isProfileLoaded) {
            this.loadProfile();
        }
    },
    loadProfile: function () {
        this.playerProfile = new PlayerProfile();
        if (typeof FBInstant === 'undefined') {
            this.playerProfile.currentLevel = 1;
            this.playerProfile.rank = [0, 0, 0];
        } else {
            FBInstant.player.getDataAsync(['currentLevel', 'rank'])
                .then(function (data) {
                    this.playerProfile.currentLevel = data['currentLevel'] || 1;
                    this.playerProfile.rank = data['rank'] || [0, 0, 0];
                }.bind(this)).catch(function (e) {
                    //console.log(e);
                });
        }

        this._isProfileLoaded = true;
    },
    updateProfile: function (level, ranked) {
        let levelNum = Number(level.slice(5));
        if (levelNum == this.playerProfile.currentLevel) {
            this.playerProfile.currentLevel += 1;
        }
        if (this.playerProfile.rank[levelNum - 1] < ranked) {
            this.playerProfile.rank[levelNum - 1] = ranked;
        }
        if(typeof FBInstant !== 'undefined'){
            FBInstant.player.setDataAsync({
                currentLevel: this.playerProfile.currentLevel,
                rank: this.playerProfile.rank
            }).then(function () {
                console.log('data is set');
            });
        }
    },
    loadSceneWithTransition: function (scene) {
        cc.tween(this.node).to(0.2, { opacity: 255 })
            .call(() => { cc.director.loadScene(scene, this.onSceneLauched.bind(this)) }).start();
    },
    onSceneLauched: function () {
        cc.tween(this.node).to(0.2, { opacity: 0 }).start();
    },
});
