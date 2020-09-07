cc.Class({
    extends: cc.Component,

    properties: {
        scrollSpeed: 1,
    },

    setScrollSpeed: function (speed) {
        let children = this.onDestroy.children;
        let comp;
        for(child in children){
            comp = child.getComponent("EndlessScrollSprites");
            if(comp){
                comp.scrollSpeed = speed; 
            }
        }
    }
});
