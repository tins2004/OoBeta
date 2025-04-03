const { ccclass, property } = cc._decorator;
import { SpecialCellEffectType } from "../SpecialCellData";
import { DataManager } from '../../DataManager';
import DienMerge from "./DienMerge";

@ccclass
export default class DienSelectionScene extends cc.Component {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.ScrollView)
    homeScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    dienItemPrefab: cc.Prefab = null;

    @property(cc.Button)
    startButton: cc.Button = null;

    @property(cc.Node)
    loadLayout: cc.Node = null;

    @property([cc.SpriteFrame])
    cellSprites: cc.SpriteFrame[] = [];

    @property([cc.Sprite])
    selectedDienSprites: cc.Sprite[] = [];

    selectedDien: any[];

    protected onLoad(): void {
        this.startButton.node.on("click", () => this.onStartButton());

        this.loadAndDisplayDien();
    }

    loadAndDisplayDien() {
        // let dienListString = cc.sys.localStorage.getItem("DienData");
        let dienList = DataManager.instance.dataDien;
        if (dienList) {
            // let dienList = JSON.parse(dienListString);

            // Tính toán chiều cao của content
            this.calculateContentHeight(dienList, 2, this.scrollView);
            this.calculateContentHeight(dienList, 1, this.homeScrollView);

            dienList.forEach((dienData, index) => {
                let dienItem = cc.instantiate(this.dienItemPrefab);
                this.setupDienItem(dienItem, dienData, false);
                this.scrollView.content.addChild(dienItem);

                // Tạo item cho homeScrollView (nếu cần)
                let quanItemHomeScrollView = cc.instantiate(this.dienItemPrefab);
                this.setupDienItem(quanItemHomeScrollView, dienData, true);
                this.homeScrollView.content.addChild(quanItemHomeScrollView);

                // console.log(`Đã thêm ${dienData.name} thứ ${index}`);
            });
        }
    }

    setupDienItem(dienItem: cc.Node, dienData: any, isHome: boolean) {
        // Lấy các node con từ item prefab
        let dienSprite = dienItem.getChildByName("Sprite").getComponent(cc.Sprite);
        let infoLabel = dienItem.getChildByName("InfoLabel").getComponent(cc.Label);
        let nameLabel = dienItem.getChildByName("NameLabel").getComponent(cc.Label);
        let selectButton = dienItem.getChildByName("SelectButton");
        let selectButtonLabel = selectButton.getChildByName("Background").getChildByName("Label").getComponent(cc.Label);
        // console.log(dienData)
        nameLabel.string = dienData.name;
        infoLabel.string = dienData.info;

        dienSprite.spriteFrame = this.getSpriteFromEffectType(dienData.effect);

        selectButtonLabel.string = `Chọn: ${dienData.id}`;

        if (isHome){
            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.selectQuanMerge(dienData, selectButtonLabel);
            });
        }
        else{

            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.selectDienFight(dienData);
            });
        }
    }

    getSpriteFromEffectType(effectType: SpecialCellEffectType): cc.SpriteFrame {
        switch (effectType) {
            case SpecialCellEffectType.DAMAGE_BOOST:
                return this.cellSprites[0];
            case SpecialCellEffectType.HEAL_BOOST:
                return this.cellSprites[1];
            case SpecialCellEffectType.POISON_BOOST:
                return this.cellSprites[2];
            case SpecialCellEffectType.BURN_BOOST:
                return this.cellSprites[3];
            case SpecialCellEffectType.WEAKNESS_BOOST:
                return this.cellSprites[4];
            case SpecialCellEffectType.ATTACK_BOOST:
                return this.cellSprites[5];
        }
    }

    selectDienFight(dienData: any) {
        if (!this.selectedDien) {
            this.selectedDien = [];
        }

        const isAlreadySelected = this.selectedDien.some(selected => selected.id === dienData.id);

        if (isAlreadySelected) {
            console.log(`"${dienData.name}" đã được chọn.`);
            return; // Không chọn lại nếu đã có
        }
    
        if (this.selectedDien.length < 3) {
            this.selectedDien.push(dienData);
        } else {
            this.selectedDien.shift();
            this.selectedDien.push(dienData);
        }

        // this.selectedDienSprites[0].spriteFrame = this.selectedDien[0].
        this.selectedDienSprites.forEach((spriteDien, index) => {
            if (this.selectedDien[index] == null) return;
            spriteDien.spriteFrame = this.getSpriteFromEffectType(this.selectedDien[index].effect);
            spriteDien.node.getChildByName("IDLabel").getComponent(cc.Label).string = "ID: " + this.selectedDien[index].id;
        });
    }

    selectQuanMerge(selectedDien: any, buttonLabel: cc.Label){
            if (DienMerge.instance.selectQuan(selectedDien, buttonLabel))
                buttonLabel.string = `Đã chọn`;
            // console.log("Đã chọn " + selectedQuan.color)
        }
    


    calculateContentHeight(dienList: any[], itemRow: number, scrollView: cc.ScrollView) {
        if (!this.dienItemPrefab) return;
    
        // Tạo một instance tạm thời của Prefab để lấy kích thước
        let tempItem = cc.instantiate(this.dienItemPrefab);
        let itemHeight = tempItem.height; // Lấy chiều cao của node gốc
    
        let rowSpacing = 10;
        let padding = 10;
    
        let itemCount = dienList.length;
        let rows = Math.ceil(itemCount / itemRow);
    
        let contentHeight = rows * itemHeight + (rows - 1) * rowSpacing + padding * 2;
        scrollView.content.height = contentHeight;
    
        // Hủy instance tạm thời
        tempItem.destroy();
    }

    onStartButton(){
        DataManager.instance.selectionDien = this.selectedDien;
        
        this.loadLayout.active = true;
        cc.director.loadScene("Game Test");

        // console.log("QUan " + DataManager.instance.selectionQuan);

        // DataManager.instance.selectionDien.forEach((dataDien) => {
        //     console.log("Dien " + dataDien.id);
        // });
    }
}