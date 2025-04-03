const axios = require('axios');
const config = require('./config/config');
const key = require('./config/key');

cc.Class({
    extends: cc.Component,

    properties: {
        connectButton: cc.Button,
    },

    onLoad() {
        this.connectButton.node.on('click', this.mintNFT, this);
    },

    mintNFT() {
        if (!cc.game.walletAddress) {
            console.log("Chưa có địa chỉ ví nào được lưu!");
            return;
        }
        const API_URL = `${config.URL_API_Immutable}/chains/${key.CHAIN_NAME}/collections/${key.CONTRACT_ADDRESS}/nfts/mint-requests`;

        // Dữ liệu gửi đi
        const requestData = {
            assets: [
                {
                    reference_id: "67f7d464-b8f0-a-9a3b", // ID tham chiếu duy nhất - là id vật phẩm trong DB
                    owner_address: cc.game.walletAddress, // Địa chỉ nhận NFT
                    // token_id: "1", // ID token (cần thiết cho ERC1155) - Không cần vì hệ thống sẽ tự tạo
                    amount: "1", // Số lượng NFT mint (cần thiết cho ERC1155)
                    metadata: {
                        name: "Sword",
                        description: "2022-08-16T17:43:26.991388Z",
                        image: "https://some-url"
                        // external_url: "https://some-url", //Link mở rộng, có thể trỏ đến một trang web hiển thị thông tin NFT.
                        // animation_url: "https://some-url",//Nếu NFT có hiệu ứng động (GIF, video), đường dẫn này sẽ chứa file động đó.
                        // youtube_url: "https://some-url",//Nếu NFT có liên quan đến video YouTube, link này sẽ trỏ đến video.
                        // attributes: [ //Danh sách các thuộc tính đặc biệt giúp NFT có giá trị riêng biệt. 
                        //     {
                        //         display_type: "number",
                        //         trait_type: "Aqua Power",
                        //         value: "Happy"
                        //     }
                        // ]
                    }
                }
            ]
        };

        axios.post(API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'x-immutable-api-key': key.API_KEY // Thêm API Key vào header
            }
        })
        .then(response => {
            console.log("Mint thành công:", response.data);
        })
        .catch(error => {
            console.error("Lỗi khi mint NFT:", error.response ? error.response.data : error.message);
        });
    }
});
