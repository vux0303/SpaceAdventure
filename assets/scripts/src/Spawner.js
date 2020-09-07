const PatternBase = require("./spawnpatterns/PatternBase");
const StateMachine = require("../external/fsm/app");
const { levelResult } = require("./Enum");
const award = require("./Enum").award;

var spawnIdx = cc.Enum({
    none: -2,
    Grid: 0,
    Dropdown: 1
})

var spawnMap = [
    "GridSpawn",
    "DropdownSpawn"
]

var retreatIdx = cc.Enum({
    none: -2,
    Side: 0,
})

var retreatMap = [
    "SideRetreat",
]

var Spawner = cc.Class({
    extends: cc.Component,

    properties: {
        _currentSpawnIdx: 0,
        _spawnPattern: null,
        _retreatPattern: null,
        _gameplayMgr: null,
        _deathCount: 0,
        _shootDown: 0,
        _cloneList: {
            default: [],
            type: [cc.Node]
        },
        _totalUnit: 0,
        _repeatOnFinishSpawning: false,
        protoList: {
            default: [],
            type: [cc.Node], //why not prefab? use this instance of prefab for diverse types of opponents (dmg, hp)
            displayName: "Prototypes",
            tooltip: "Prototypes use to generate objects for pattern"
        },
        delay: {
            default: 0,
            tooltip: "delay before spawn"
        },
        useProto: {
            default: false,
            tooltip: "use prototype objects (children) as candidate",
            notify: function () { if (this.useProto) this.repeat = 0; }
        },
        repeat: {
            default: 0,
            step: 1,
            tooltip: "repeat on pattern complete if killOnFinish = true, on pattern clear if false. -1 will repeat spawning forever",
            visible: function () { return !this.useProto }
        },
        spawnInterval: {
            default: 0.5,
            tooltip: "the time interval between each spawn in second"
        },
        isdropItem: {
            default: false,
            notify: function () {
                this.award = this.isdropItem ? award.heal : null;
            }
        },
        award: {
            default: award.heal,
            type: award,
            visible: function () { return this.isdropItem }
        },
        parallelSpawner: cc.Node,
        onSpawnFinishSpawner: cc.Node,
        onPatternCompleteSpawner: cc.Node,
        onPatternClearSpawner: cc.Node,
        onRetreatSpawner: cc.Node,
        spawnOption: {
            default: spawnIdx.none,
            type: spawnIdx,
            notify: function (oldValue) {
                if (oldValue != spawnIdx.none) this.node.removeComponent(spawnMap[oldValue]);
                if (this.spawnOption != spawnIdx.none) {
                    this._spawnPattern = this.node.addComponent(spawnMap[this.spawnOption]);
                } else {
                    this.node.removeComponent(spawnMap[oldValue]);
                }
            }
        },
        retreatOption: {
            default: retreatIdx.none,
            type: retreatIdx,
            notify: function (oldValue) {
                if (oldValue != retreatIdx.none) this.node.removeComponent(retreatMap[oldValue]);
                if (this.retreatOption != retreatIdx.none) {
                    this._retreatPattern = this.node.addComponent(retreatMap[this.retreatOption]);
                } else {
                    this.node.removeComponent(retreatMap[oldValue]);
                }
            }
        },
        playOnLoad: false,
        lastSpawner: false,
    },
    editor: {
        disallowMultiple: true,
    },
    onLoad() {
        this._gameplayMgr = this.node.getParent().getComponent("GameplayMgr");
        if (!this._spawnPattern) {
            this._spawnPattern = this.node.getComponent(PatternBase); //mannually added
        }
        this.node.on("OpponentDown", this.onOpponentDown, this);
        this.node.on("ExploisionFinish", this.onExploisionFinish, this);
    },
    start() {
        this._totalUnit = this._spawnPattern._numTotal * (this.repeat + 1);
        this._gameplayMgr._totalSpawnUnit += this._totalUnit;
        this._deathCount = 0;
        this._shootDown = 0;
        if(this.playOnLoad){
            this.launch();
        }
    },
    update() {

    },
    startSpawning: function () {
        if (!this._spawnPattern || this.protoList.length == 0) {
            console.log("Spawner and prototyps are required");
            return;
        }
        let spawnWaves;
        if (this.useProto) {
            this._spawnPattern._numTotal = this.protoList.length;
        }
        spawnWaves = Math.floor(this._spawnPattern._numTotal / this._spawnPattern._numEachSpawn)
            + 1 * !!(this._spawnPattern._numTotal % this._spawnPattern._numEachSpawn);
        this.schedule(this.spawn, this.spawnInterval, spawnWaves - 1, this.delay);
    },
    launch: function () {
        this.startSpawning();
        if (this.parallelSpawner) {
            this.parallelSpawner.getComponent("Spawner").launch();
        }
        this._gameplayMgr._runningSpawners.push(this);
    },
    spawn: function () {
        let count = this._spawnPattern._numEachSpawn;
        let protoLength = this.protoList.length;
        let proto;
        while (count > 0) {
            let candidate;
            proto = this.protoList[this._currentSpawnIdx % protoLength]; //turn by turn, could be generalized to spawn policy for more complex patterns
            candidate = this.duplicate(proto);
            if (!this.useProto) {
                this.node.addChild(candidate);
            }
            this.giveCommand(candidate);
            if (this._currentSpawnIdx == this._spawnPattern._numTotal - 1) {
                this.onSpawnFinish();
                break;
            }
            count--;
            this._currentSpawnIdx++;
        }
    },
    duplicate: function (proto) {
        if (this.useProto) {
            return proto;
        }
        let pool = this._gameplayMgr.getPool(proto.name);
        if (!pool || pool.size() == 0) {
            return cc.instantiate(proto);
        } else {
            return pool.get(proto);
        }
    },
    giveCommand: function (clone) {
        let cloneMove;
        cloneMove = cc.tween(clone).then(this._spawnPattern.getTween(this._currentSpawnIdx));
        if (this._currentSpawnIdx == this._spawnPattern._numTotal - 1) {
            cloneMove = cloneMove.call(this.onPatternComplete, this);
        }
        this._cloneList.push(clone);
        cloneMove.start();
    },
    retreat: function () {
        for (let clone of this._cloneList) {
            let target = clone;
            clone.stopAllActions();
            clone.emit("retreat");
            this._retreatPattern.tween(clone).call(() => { this.reclaim(target) }).start();
        }
        this.onRetreat();
    },
    reset: function () {
        this.unschedule(this.spawn);
        this._currentSpawnIdx = 0;
        this._cloneList.length = 0;
        this.schedule(this.startSpawning, 0, 0);
        this.repeat--;
    },
    reclaim: function (unit) {
        let pool = this._gameplayMgr.getPool(unit.name);
        unit.cleanup();
        if (pool) {
            pool.put(unit);
        } else {
            unit.destroy();
        }
        this._deathCount++;
        if(this._deathCount == this._totalUnit){
            this.onPatternClear();
            return;
        }
        if (this._deathCount == this._totalUnit - this._spawnPattern._numTotal * this.repeat && !this.repeatOnFinishSpawning) {
            this._spawnPattern._inPositionTargets.length = 0;
            this._spawnPattern._deathCount = 0;
            this.reset();
        }
    },
    accountDeadUnit: function (unit) {
        this._cloneList = this._cloneList.filter(ele => ele._id != unit._id) //use id?
    },
    onSpawnFinish: function () {
        if (this.onSpawnFinishSpawner) {
            this.onSpawnFinishSpawner.getComponent("Spawner").launch();
        }
        if (this.repeatOnFinishSpawning) {
            if (this.repeat != 0) {
                this.reset();
            }
        }
    },
    onPatternClear: function () {
        if (this.onPatternClearSpawner) {
            this.onPatternClearSpawner.getComponent("Spawner").launch();
        }
        if(this.lastSpawner){
            let event = new cc.Event.EventCustom("GameOver", true);
            event.setUserData({result: levelResult.won});
            this.node.dispatchEvent(event);
        }
        this.node.destroy();
        this._gameplayMgr.removeSpawner(this);
    },
    onPatternComplete: function () {
        if (this.onPatternCompleteSpawner) {
            this.onPatternCompleteSpawner.getComponent("Spawner").launch();
        }
        if (this._retreatPattern) {
            this.scheduleOnce(this.retreat, this._retreatPattern.delay);
        }
    },
    onRetreat: function () {
        if (this.onRetreatSpawner) {
            this.onRetreatSpawner.getComponent("Spawner").launch();
        }
    },
    onOpponentDown: function (event) {
        if (event.getUserData().isShootDown) {
            this._shootDown++;
            if (this.isdropItem && this._shootDown == this._totalUnit) {
                this._gameplayMgr.dropAward(this.award, event.target.getPosition());
            }
        }
        this.accountDeadUnit(event.target);
    },
    onExploisionFinish: function (event) {
        this.reclaim(event.target);
    }
});

module.exports = Spawner;
