const config = require('../../config/config');

cc.Class({
    extends: cc.Component,

    properties: {
        marketButton: cc.Button,
    },


    start () {
        this.marketButton.node.on("click", () => {
            window.open(`http://${config.URL_API}:3000/`, "_blank");
          });
    },

});
