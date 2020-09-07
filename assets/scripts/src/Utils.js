var Utils = cc.Class({
    name: "Utis",
    statics:{
        getRndInterger(min, max){
            return Math.floor(Math.random() * (max - min) ) + min;
        }
    }
});

module.exports = Utils;
