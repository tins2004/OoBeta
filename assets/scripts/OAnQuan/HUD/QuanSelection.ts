const { ccclass, property } = cc._decorator;
import { EffectType } from "../Fight System/Effect";
import { DataManager } from '../../DataManager';
import QuanMerge from "./QuanMerge";

@ccclass
export default class QuanSelectionScene extends cc.Component {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.ScrollView)
    homeScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    quanItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    selectionQuanMenu: cc.Node = null;

    @property(cc.Node)
    selectionDienMenu: cc.Node = null;

    protected onLoad(): void {
        this.selectionQuanMenu.active = false;
        this.selectionDienMenu.active = false;
        this.loadAndDisplayQuan();

        cc.systemEvent.on("MINT_NFT", () => {
            console.log("Sự kiện MINT_NFT đã được phát!");
            // Xử lý sự kiện ở đây
        }, this);
    }

    loadAndDisplayQuan() {
        // let quanListString = cc.sys.localStorage.getItem("QuanData");
        let quanList = DataManager.instance.dataQuan;
        // console.log(quanList);
        if (quanList) {
            // let quanList = JSON.parse(quanListString);

            // Tính toán chiều cao của content
            this.calculateContentHeight(quanList, 5, this.scrollView);
            this.calculateContentHeight(quanList, 2, this.homeScrollView);

            quanList.forEach((quanData, index) => {
                // Tạo item cho scrollView
                let quanItemScrollView = cc.instantiate(this.quanItemPrefab);
                this.setupQuanItem(quanItemScrollView, quanData, false);
                this.scrollView.content.addChild(quanItemScrollView);
    
                // Tạo item cho homeScrollView (nếu cần)
                let quanItemHomeScrollView = cc.instantiate(this.quanItemPrefab);
                this.setupQuanItem(quanItemHomeScrollView, quanData, true);
                this.homeScrollView.content.addChild(quanItemHomeScrollView);
    
                // console.log(`Đã thêm ${quanData.color} thứ ${index}`);
            });
        }
    }

    setupQuanItem(quanItem: cc.Node, quanData: any, isHome: boolean) {
        // Lấy các node con từ item prefab
        let colorSprite = quanItem.getChildByName("Sprite").getComponent(cc.Sprite);
        let infoLabel = quanItem.getChildByName("InfoLabel").getComponent(cc.Label);
        let skillLabel = quanItem.getChildByName("SkillLabel").getComponent(cc.Label);
        let selectButton = quanItem.getChildByName("SelectButton");
        let selectButtonLabel = selectButton.getChildByName("Background").getChildByName("Label").getComponent(cc.Label);

        // console.log(quanData)
        // Thiết lập màu
        colorSprite.node.color = this.getColorFromString(quanData.color);

        // Thiết lập các chỉ số
        infoLabel.string = `${quanData.health > 0 ? quanData.health : 0}`
        infoLabel.string += `\n${quanData.damage > 0 ? quanData.damage : 0}`;
        infoLabel.string += `\n${quanData.armor > 0 ? quanData.armor : 0}`;
        infoLabel.string += `\n${quanData.speed > 0 ? quanData.speed : 0}`;
        infoLabel.string += `\n${quanData.critRate > 0 ? quanData.critRate : "---"}`;

        if (Array.isArray(quanData.skills)) {
            // console.log(quanData.skills);
            let skills: EffectType[] = quanData.skills.map((skill: number) => skill as EffectType);
            skillLabel.string = skills.map(effect => this.getSkillStringFromEffectTypeString(EffectType[effect])).join("\n");
            
            quanItem.color = this.getColorFromLevel(quanData);
        } else 
            console.log("quanData.skills không phải là một mảng.");

        // console.log(quanData)
        selectButtonLabel.string = `Chọn: ${quanData.id}`;
        if (isHome){

            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.selectQuanMerge(quanData, selectButtonLabel);
            });
        }
        else{

            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.selectQuanFight(quanData);
            });
        }
    }

    selectQuanFight(selectedQuan: any){

        let quanData = {
            id: selectedQuan.id,
            color: this.getColorFromString(selectedQuan.color),
            health: selectedQuan.health,
            damage: selectedQuan.damage,
            armor: selectedQuan.armor,
            speed: selectedQuan.speed,
            critRate: selectedQuan.critRate,
            skills: selectedQuan.skills,
        };


        DataManager.instance.selectionQuan = quanData;
        this.selectionQuanMenu.active = false;
        this.selectionDienMenu.active = true;
    }

    selectQuanMerge(selectedQuan: any, buttonLabel: cc.Label){
        if (QuanMerge.instance.selectQuan(selectedQuan, buttonLabel))
            buttonLabel.string = `Đã chọn`;
        // console.log("Đã chọn " + selectedQuan.color)
    }

    getColorFromString(colorName: string): cc.Color {
        switch (colorName.toLowerCase()) {
            case "yellow":
                return cc.color(194, 230, 118, 255);
            case "pink":
                return cc.color(221, 118, 230, 255);
            case "blue":
                return cc.color(167, 118, 230, 255);
            case "aqua":
                return cc.color(118, 194, 230, 255);
            case "green":
                return cc.color(118, 230, 140, 255);
            case "brown":
                return cc.color(136, 126, 56, 255);
            // Thêm các màu khác nếu cần
            default:
                return cc.Color.WHITE; // Màu mặc định nếu không tìm thấy
        }
    }

    getSkillStringFromEffectTypeString(effectType: string): string {
        switch (effectType) {
            case "STUN": // 0
                return "Gây choáng kẻ thù"
            case "BURN": // 1
                return "Gây cháy kẻ thù"
            case "DEBUFF_ARMOR": // 2
                return "Giảm giáp kẻ thù"
            case "WEAKNESS": // 3
                return "Giảm sức mạnh kẻ thù"
            case "SLOW": // 4
                return "Làm chậm kẻ thù"
            case "CONFUSION": // 5
                return "Giảm chí mạng kẻ thù"
            case "POISON": // 6
                return "Gây độc lên kẻ thù"
            case "STRENGTH": // 7
                return "Tăng sức mạnh"
            case "TOUGHNESS": // 8
                return "Tăng phòng thủ"
            case "AGILITY": // 9
                return "Tăng tốc độ"
            case "FOCUS": // 10
                return "Tăng chí mạng"
            case "BLOCK": // 11
                return "Chặn sát thương"
        }
    }

    getColorFromLevel(quanData: any): cc.Color {
        if (quanData.skills.length > 0 && quanData.skills[0] != null){ // Nếu nó vượt qua cấp sỏi -> đá
            if (quanData.skills.length > 1 && quanData.skills[1] != null) // Nó vượt qua cấp đá quý -> không xác định
                return cc.color(216, 177, 95, 255);

            if (quanData.critRate > 0) // Nếu nó vượt qua cấp đá -> đá quý
                return cc.color(139, 99, 146, 255);

            return cc.color(132, 145, 187, 255);
        }

        return cc.color(108, 143, 130, 255); // Nếu nó là cấp sỏi
    }

    calculateContentHeight(quanList: any[], itemRow: number, scrollView: cc.ScrollView) {
        if (!this.quanItemPrefab) return;
    
        // Tạo một instance tạm thời của Prefab để lấy kích thước
        let tempItem = cc.instantiate(this.quanItemPrefab);
        let itemHeight = tempItem.height; // Lấy chiều cao của node gốc
    
        let rowSpacing = 10;
        let padding = 10;
    
        let itemCount = quanList.length;
        let rows = Math.ceil(itemCount / itemRow);
    
        let contentHeight = rows * itemHeight + (rows - 1) * rowSpacing + padding * 2;
        scrollView.content.height = contentHeight;
    
        // Hủy instance tạm thời
        tempItem.destroy();
    }
}