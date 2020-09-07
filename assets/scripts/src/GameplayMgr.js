const { levelResult } = require("./Enum");

const award = require("./Enum").award;

var PoolSetting = cc.Class({
    name: "poolSetting",
    properties: {
        prefab: cc.Prefab,
        initCount: 0,
    },
})

cc.Class({
    extends: cc.Component,

    properties: {
        awards: {
            default: [],
            type: [cc.Prefab],
        },
        pools: {
            type: [PoolSetting],
            default: [],
        },
        _pools: {
            default: [],
            type: [cc.NodePool],
        },
        _totalShootDown: 0,
        _totalSpawnUnit: 0,
        _runningSpawners: [],
        pauseMenu: cc.Node,
    },

    onLoad() {
        let pool;
        let len;
        let i;
        for (let setting of this.pools) {
            len = setting.initCount;
            //the second comp will be handlercomp, should imp inspector to selector desire comp
            if (setting.prefab.data._components[1]) {
                pool = new cc.NodePool(setting.prefab.data._components[1].constructor);
                pool['name'] = setting.prefab.data.name;
                for (i = 0; i < len; i++) {
                    pool.put(cc.instantiate(setting.prefab));
                }
                this._pools.push(pool);
            }
        }

        var collisionMgr = cc.director.getCollisionManager();
        collisionMgr.enabled = true;

        this.node.on("GameOver", this.onGameOver, this);
        this.node.on("MCHealthChanged", this.onMCHealthChanged, this);
        this.node.on("OpponentDown", this.onOpponentDown, this);
    },
    getPool: function (poolHandler) {
        for (let pool of this._pools) {
            if (pool.name === poolHandler) {
                return pool;
            }
        }
        return null;
    },
    onGameOver: function (event) {
        let ranked = this.evaluateResult();
        if(event.getUserData().result == levelResult.won){
            this.pauseMenu.emit("GameOver", levelResult.won, ranked);
            if(cc.find("GameMgr")){
                cc.find("GameMgr").getComponent("GameMgr").updateProfile(cc.director.getScene().name, ranked);
            }
        }
        else{
            this.pauseMenu.emit("GameOver", levelResult.lost, 0);
        }
        for (let spawner of this._runningSpawners) {
            spawner.node.destroy();
        }
    },
    onMCHealthChanged: function (event) {
        this.pauseMenu.emit("MCHealthChanged", event.getUserData());
    },
    onOpponentDown: function (event) {
        if (event.getUserData().isShootDown) {
            this._totalShootDown++;
        }
        //update score;
        //this.pauseMenu.emit
    },
    dropAward: function (type, position) {
        let item = cc.instantiate(this.awards[type]);
        this.node.addChild(item);
        item.setPosition(position);
    },
    evaluateResult: function () {
        return 3;
        if (this._totalShootDown > this._totalSpawnUnit * 80 / 100) {
            return 3;
        } else if (this._totalShootDown > this._totalSpawnUnit * 70 / 100) {
            return 2;
        } else {
            return 1;
        }

    },
    removeSpawner: function (Spawner) {
        this._runningSpawners = this._runningSpawners.filter(ele => ele.node.active);
    }
});
