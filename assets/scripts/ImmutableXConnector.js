const axios = require('axios');
const config = require('./config/config');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function () {
        this.connectImmutableX(); // Gọi hàm kết nối khi load script
    },

    connectImmutableX: function () {
        let url = `${config.URL_API_Immutable}/assets`; // URL API của Immutable X

        axios.get(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            cc.log("Kết nối Immutable X thành công! Dữ liệu nhận được:", response.data);
        })
        .catch(error => {
            cc.error("Lỗi kết nối Immutable X:", error.response ? error.response.data : error.message);
        });
    }
});
