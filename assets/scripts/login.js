const Web3 = require('web3.min');

cc.Class({
    extends: cc.Component,

    properties: {
        connectButton: cc.Button,
        addressLabel: cc.Label,
        getButton: cc.Button,
        sendButton: cc.Button,
    },

    onLoad() {
        this.web3 = null;
        this.address = '';
        this.addressLabel.string = 'Address: Not Connected';

        this.connectButton.node.on('click', this.initWeb3, this);
        this.getButton.node.on('click', this.getBalance, this);
    },

    initWeb3() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    this.address = accounts[0];
                    cc.game.walletAddress = this.address; // Lưu địa chỉ ví vào biến toàn cục
                    this.addressLabel.string = 'Address: ' + this.address;
                })
                .catch(error => {
                    console.error('MetaMask connection error:', error);
                });
        } else {
            console.error('MetaMask is not installed.');
        }
    },
    
    async getBalance() {
        if (!this.web3 || !this.address) {
            console.error('Web3 not initialized or address not available.');
            return;
        }

        try {
            const balanceWei = await this.web3.eth.getBalance(this.address);
            const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
            //Hiển thị số dư lên label hoặc nơi thích hợp khác
            this.addressLabel.string = 'Address: ' + this.address + '\nBalance:' + balanceEth + ' ETH';

            this.sendEther('0xBc5d7BbA7d3CcF6CD57653b2D992B168e9b22D89', 0.0001);// chủ game
            this.addressLabel.string +=  '\nBalance:' + balanceEth + ' ETH';
            return balanceEth;
        } catch (error) {
            console.error('Error getting balance:', error);
        }
    },

    async sendEther(toAddress, amountEth) {
        if (!this.web3 || !this.address) {
            console.error('Web3 not initialized or address not available.');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amountEth.toString(), 'ether');
            const transactionObject = {
                from: this.address,
                to: toAddress,
                value: amountWei,
            };

            const transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionObject],
            });

            console.log('Transaction Hash:', transactionHash);
        } catch (error) {
            console.error('Error sending Ether:', error);
        }
    },
});
