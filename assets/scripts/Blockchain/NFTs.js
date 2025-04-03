const axios = require('axios');
const config = require('../config/config');
const DataManager = require('../DataManager');

cc.Class({
    extends: cc.Component,

    imageHash: String,
    imageNameFile: String,
    dataNFT: cc.Object,

    onLoad() {
        cc.systemEvent.on("MINT_NFT_QUAN", () => this.mintNFT(0), this);
        cc.systemEvent.on("MINT_NFT_DIEN", () => this.mintNFT(1), this);
        cc.systemEvent.on("GET_NFTs", () => this.getNFTs(), this);
    },

    async mintNFT(typeNFT) {
        // typeNFT: 0: Quan - 1: Điền
        console.log("MINT_NFT");
        switch (typeNFT){
            case 0:
                dataNFT = DataManager.DataManager.instance.gachaQuan();
                imageNameFile = "Character-Idel-0"
                break;
            case 1:
                dataNFT = DataManager.DataManager.instance.gachaDien();
                break;
        }
        // console.log(dataNFT.name)
        switch (dataNFT.name){
            case "Lâu đài":
                imageNameFile = "Cell_Damage"
                break;
            case "Ruộng lúa":
                imageNameFile = "Cell_Heal"
                break;
            case "Rừng rậm":
                imageNameFile = "Cell_Posion"
                break;
            case "Núi lửa":
                imageNameFile = "Cell_Brun"
                break;
            case "Hồ băng":
                imageNameFile = "Cell_Weakness"
                break;
            case "Hải đăng":
                imageNameFile = "Cell_Attack"
                break;
        }
        cc.resources.load(`Cell_Icons/${imageNameFile}`, async (err, asset) => {
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
                imageHash = result.data.ipfsHash;
                // console.log("IPFS upload result:", this.imageHash);
                setImage(`http://${config.URL_API}:8080/ipfs/${imageHash}`); 
            } catch (error) {
                console.log("IPFS image upload error: ", error);
            }
            }
        },
    
        sendNFTData() {
            if (!DataManager.DataManager.instance.walletAddress) {
                console.warn("Chưa có địa chỉ ví nào được lưu!");
                return;
            }

            let jsonData = {};

            // console.log(dataNFT)

            if (dataNFT.name == null){
                jsonData = {
                    "type": "Quan",
                    "image": `http://${config.URL_API}:8080/ipfs/${imageHash}`,
                    "name": "Quan",
                    "attributes": {
                        "color": dataNFT.color,
                        "health": dataNFT.health,
                        "attack": dataNFT.damage,
                        "armor": dataNFT.armor,
                        "speed": dataNFT.speed,
                        "effect1": dataNFT.skills[0] != null ? dataNFT.skills[0] : null,
                        "critical": dataNFT.critRate != null ? dataNFT.critRate : 0,
                        "effect2": dataNFT.skills[1] != null ? dataNFT.skills[1] : null,
                        "effect3": dataNFT.skills[2] != null ? dataNFT.skills[2] : null
                    },
                    "wallet": DataManager.DataManager.instance.walletAddress
                }
            } else {
                jsonData = {
                    "type": "Điền",
                    "image": `http://${config.URL_API}:8080/ipfs/${imageHash}`,
                    "name": dataNFT.name,
                    "attributes": {
                        "info": dataNFT.info,
                        "effect": dataNFT.effect,
                        "stats": dataNFT.stat
                    },
                    "wallet": DataManager.DataManager.instance.walletAddress
                };
            }
            
        
            axios.post(`http://${config.URL_API}:4000/nft/createNFT`, jsonData, {
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log('API response:', response.data);
                
                this.getNFTs();
            })
            .catch(error => {
                console.error('API error:', error);
            });
            },

    getNFTs() {
        if (!DataManager.DataManager.instance.walletAddress) {
            console.warn("Chưa có địa chỉ ví nào được lưu!");
            return;
        }
        const API_URL = `http://${config.URL_API}:4000/nft/ownedNFTs/${DataManager.DataManager.instance.walletAddress}`;

        axios.get(API_URL, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(async response => {
            // console.log("Lấy thành công:", response.data.tokenIds);

            let dataDien = [];
            let dataQuan = [];

            // console.log(response.data)
            
            response.data.ipfsUrls.forEach(async (ipfsUrl, index) => {
                const updatedUrl = ipfsUrl.replace("localhost", config.URL_API);
                const metadataRes = await fetch(updatedUrl);
                const metadata = await metadataRes.json();

                metadata.image = metadata.image.replace("localhost", config.URL_API);

                if (metadata.type == "Quan"){
                    let quanData = {
                        id: response.data.tokenIds[index].hex,
                        color: metadata.attributes.color,
                        health: metadata.attributes.health,
                        damage: metadata.attributes.attack,
                        armor: metadata.attributes.armor,
                        speed: metadata.attributes.speed,
                        critRate: metadata.attributes.critical,
                        skills: [metadata.attributes.effect1, metadata.attributes.effect2, metadata.attributes.effect3],
                    };
                    
                    dataQuan.push(quanData);
                }
                if (metadata.type == "Điền"){
                    let dienData = {
                        id: response.data.tokenIds[index].hex,
                        name: metadata.name,
                        info: metadata.attributes.info,
                        effect: metadata.attributes.effect,
                        stat: metadata.attributes.stats
                    }

                    dataDien.push(dienData);
                }
            });

            DataManager.DataManager.instance.dataDien = dataDien;
            DataManager.DataManager.instance.dataQuan = dataQuan;

            // console.log(DataManager.DataManager.instance.dataQuan)
        })
        .catch(error => {
            console.error("Lỗi khi lấy NFT:", error.response ? error.response.data : error.message);
        });
    }
});
