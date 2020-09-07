var levelResult = cc.Enum({
    lost: 0,
    won: 1,
});

var award = cc.Enum({
    heal: 0,
    attackSpeed: 1,
    upgrade: 2,
});

module.exports.levelResult = levelResult;
module.exports.award = award;
