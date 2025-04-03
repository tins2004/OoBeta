const Web3 = require('web3.min');
const DataManager = require('../DataManager');

cc.Class({
    extends: cc.Component,

    properties: {
        connectButton: cc.Button,
        messLabel: cc.Label,
        messPanel: cc.Node,
        loadLayout: cc.Node,
    },

    onLoad() {
        this.web3 = null;
        this.address = '';
        
        this.loadLayout.active = false;
        this.connectButton.node.on('click', this.login, this);
        
        this.login();
    },

    login(){
        this.messPanel.active = false;
        setTimeout(() => {
            this.connectWallet();
        }, 500);
    },

    connectWallet() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    this.address = accounts[0];
                    DataManager.DataManager.instance.walletAddress = this.address;
                    // console.log('Đăng nhập ví thành công');

                    this.messLabel.string = "Đăng nhập ví thành công. Đang vào trò chơi...";
                    this.messPanel.active = true; 
                    
                    setTimeout(() => {
                        this.loadLayout.active = true; 
                    }, 500);
                    setTimeout(() => {
                        console.log(this.address + "    " + DataManager.DataManager.instance.walletAddress)
                        this.callGetNFTs();
                    }, 500);
                })
                .catch(error => {
                    console.error('Kết nối với ví thất bại:', error);

                    this.messLabel.string = "Đăng nhập thất bại.\nBấm vào đây để kết nối lại!";
                    this.messPanel.active = true;
                });
        } else {
            console.error('MetaMask chưa được cài đặt.');

            this.messLabel.string = "MetaMask chưa được cài đặt.\nBấm vào đây để kết nối lại!";
            this.messPanel.active = true;
        }
    },

    async callGetNFTs() {
        const NFTsComponent = this.node.getComponent('NFTs');
        if (NFTsComponent) {
            NFTsComponent.getNFTs();

            setTimeout(async () => {
                console.log(DataManager.DataManager.instance.dataDien + " + " + DataManager.DataManager.instance.dataQuan )
                if (DataManager.DataManager.instance.dataDien.length < 1 && DataManager.DataManager.instance.dataQuan.length < 1){
                    console.log("Chưa có dữ liệu, tạo dữ liệu mới.")
                    await NFTsComponent.mintNFT(0); 
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    await NFTsComponent.mintNFT(1); 
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    await cc.director.loadScene("Home Menu");
                }else{
                    cc.director.loadScene("Home Menu");
                }
              }, 2000);
        } else {
            console.error("Không tìm thấy component NFTs trên Node.");
        }
    },
});
