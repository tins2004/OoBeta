const axios = require('axios');
const config = require('./config/config');
const key = require('./config/key');
const DataManager = require('./DataManager');

cc.Class({
    extends: cc.Component,

    properties: {
        mintButton: cc.Button,
        getButton: cc.Button,
    },

    imageHash: String,

    onLoad() {
        this.mintButton.node.on('click', this.mintNFT, this);
        this.getButton.node.on('click', this.getNFTs, this);
    },

    async mintNFT(typeNFT) {
        // typeNFT: 0: Quan - 1: Lâu đài - 2: Ruộng lúa - 3: Rừng rậm - 4: Núi lửa - 5: Hồ băng - 6: Hải đăng
        // switch
        cc.resources.load("Cell_Icons/Cell_Attack", async (err, asset) => {
          if (err) {
            console.error("Lỗi tải file:", err);
            return;
          }
    
          await this.processFile(asset);
          this.sendNFTData()
        });
      },
    
      async processFile(asset) {
        let fileBlob;
    
        if (asset instanceof cc.Texture2D) {
          const canvas = document.createElement("canvas");
          const texture = asset;
          canvas.width = texture.width;
          canvas.height = texture.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(texture.getHtmlElementObj(), 0, 0);
    
          await new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
              fileBlob = blob;
              await this.uploadToIPFS(fileBlob);
              resolve();
            }, "image/png");
          });
        } else if (asset instanceof cc.SpriteFrame) {
          const texture = asset.getTexture();
          const canvas = document.createElement("canvas");
          canvas.width = texture.width;
          canvas.height = texture.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(texture.getHtmlElementObj(), 0, 0);
    
          await new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
              fileBlob = blob;
              await this.uploadToIPFS(fileBlob);
              resolve();
            }, "image/png");
          });
        } else {
          console.error("Loại asset không được hỗ trợ.");
        }
      },
    
      async uploadToIPFS(file) {
        if (typeof file !== "undefined") {
          try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await axios.post(`http://${config.URL_API}:4000/upload`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            this.imageHash = result.data.ipfsHash;
            console.log("IPFS upload result:", this.imageHash);
            setImage(`http://${config.URL_API}:8080/ipfs/${this.imageHash}`); 
          } catch (error) {
            console.log("IPFS image upload error: ", error);
          }
        }
      },

      sendNFTData() {
        const jsonData = {
          "type": "Điền",
          "image": `http://${config.URL_API}:8080/ipfs/${this.imageHash}`,
          "name": "Điền Test ",
          "attributes": {
            "info": "This is a test Điền",
            "effect": "Special Effect",
            "stats": "High Stats"
          },
          "wallet": cc.game.walletAddress
        };
    
        axios.post(`http://${config.URL_API}:4000/nft/createNFT`, jsonData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log('API response:', response.data);
          // Xử lý phản hồi thành công (ví dụ: hiển thị thông báo)
        })
        .catch(error => {
          console.error('API error:', error);
          // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
        });
      },


    getNFTs() {
        if (!cc.game.walletAddress) {
            console.warn("Chưa có địa chỉ ví nào được lưu!");
            return;
        }
        const API_URL = `http://${config.URL_API}:4000/nft/ownedNFTs/${cc.game.walletAddress}`;

        axios.get(API_URL, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(async response => {
            console.log("Lấy thành công:", response.data.tokenIds);

            let dataDien = [];
            let dataQuan = []
            
            response.data.ipfsUrls.forEach(async ipfsUrl => {
                const updatedUrl = ipfsUrl.replace("localhost", config.URL_API);
                const metadataRes = await fetch(updatedUrl);
                const metadata = await metadataRes.json();

                metadata.image = metadata.image.replace("localhost", config.URL_API);

                // console.log("Lấy: ", metadata.type);
                // console.log("Lấy: ", metadata.attributes.type);
                // DataManager.instance.dataQuan.push(metadata.attributes);

                if (metadata.type == "Quan")
                    dataQuan.push(metadata.attributes);
                if (metadata.type == "Điền")
                    dataDien.push(metadata.attributes);
            });

            DataManager.DataManager.instance.dataDien = dataDien;
            DataManager.DataManager.instance.dataQuan = dataQuan;

            console.log(DataManager.DataManager.instance.dataQuan);
        })
        .catch(error => {
            console.error("Lỗi khi lấy NFT:", error.response ? error.response.data : error.message);
        });
    }
});
