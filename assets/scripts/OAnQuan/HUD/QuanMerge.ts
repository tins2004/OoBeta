import { EffectType } from "../Fight System/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuanMerge extends cc.Component {

    private static _instance: QuanMerge = null;

    public static get instance(): QuanMerge {
        if (!this._instance) {
            console.error("QuanMerge instance is not initialized yet!");
        }
        return this._instance;
    }

    @property({ type: cc.Node, tooltip: 'Nút Log Merge' })
    logMergeButton: cc.Node = null;

    @property(cc.Node)
    quanItem: cc.Node[] = [];

    public selectedQuanMerge: any[] = []; 
    public selectedQuanButtonLabel: cc.Label[] = []; 

    protected onLoad(): void {
        if (!QuanMerge._instance) {
            QuanMerge._instance = this;
            // cc.game.addPersistRootNode(this.node); // Giữ node này tồn tại giữa các scene
        } else {
            this.destroy(); // Nếu đã có instance, hủy node hiện tại
        }

        if (this.logMergeButton) {
            this.logMergeButton.on('click', this.quanMerge, this);
        }

        this.updateDisplay(); // Cập nhật hiển thị ban đầu
    }


    public selectQuan(quanData: any, quanButtonLabel: cc.Label): boolean {
        // Kiểm tra xem quanData.id đã tồn tại trong selectedQuanMerge chưa
        const isAlreadySelected = this.selectedQuanMerge.some(selectedQuan => selectedQuan && selectedQuan.id === quanData.id);
    
        if (isAlreadySelected) {
            console.log(`Quan với ID ${quanData.id} đã được chọn.`);
            return false; // Không thêm nếu đã được chọn
        }
    
        if (this.selectedQuanMerge.length < 2 && this.selectedQuanMerge.length < 2) {
            this.selectedQuanMerge.push(quanData);
            this.selectedQuanButtonLabel.push(quanButtonLabel);
            this.updateDisplay();
            // console.log(`Đã chọn Quan ${quanData.id}. Tổng số Quan đã chọn: ${this.selectedQuanMerge.length}`);
            return true;
        } else {
            console.log("Đã chọn đủ 2 Quan. Không thể chọn thêm.");
            return false;
        }
    }

    private deleteQuan1(): void {
        if (this.selectedQuanMerge.length > 0) {
            this.selectedQuanButtonLabel[0].string = `Chọn: ${this.selectedQuanMerge[0].id}`;

            this.selectedQuanMerge.splice(0, 1); // Xóa phần tử thứ hai
            this.selectedQuanButtonLabel.splice(0, 1); // Xóa phần tử đầu tiên
            this.updateDisplay();
            // console.log("Đã xóa Quan 1.");
        } else {
            console.log("Chưa có Quan 1 để xóa.");
        }
    }

    private deleteQuan2(): void {
        if (this.selectedQuanMerge.length > 1) {
            this.selectedQuanButtonLabel[1].string = `Chọn: ${this.selectedQuanMerge[1].id}`;

            this.selectedQuanMerge.splice(1, 1); // Xóa phần tử thứ hai
            this.selectedQuanButtonLabel.splice(1, 1); // Xóa phần tử thứ hai
            this.updateDisplay();
            // console.log("Đã xóa Quan 2.");
        } else {
            console.log("Chưa có Quan 2 để xóa.");
        }
    }

    private async quanMerge(): Promise<void> {
        if (this.selectedQuanMerge.length === 2) {
            console.log("Quan 1:", this.selectedQuanMerge[0]);
            console.log("Quan 2:", this.selectedQuanMerge[1]);
            await cc.systemEvent.emit("MINT_NFT_QUAN");
            await new Promise(resolve => setTimeout(resolve, 2000));
            await cc.systemEvent.emit("GET_NFTs");
            await new Promise(resolve => setTimeout(resolve, 2000));
            await console.log("Cập nhật")
            await this.updateDisplay();
        } else {
            console.log("Chưa có Quan nào được chọn.");
        }
    }

    private updateDisplay(): void {
        if (this.quanItem.length < 2) return;

        let quanDataNull = {
            id: null,
            color: "",
            health: 0,
            damage: 0,
            armor: 0,
            speed: 0,
            critRate: 0,
            skills: null,
        };

        if (this.selectedQuanMerge[0] != null)
            this.setupQuanItem(this.quanItem[0], this.selectedQuanMerge[0], true);
        else
            this.setupQuanItem(this.quanItem[0], quanDataNull, true);

        if (this.selectedQuanMerge[1] != null)
            this.setupQuanItem(this.quanItem[1], this.selectedQuanMerge[1], false);
        else
            this.setupQuanItem(this.quanItem[1], quanDataNull, false);
    }   

    setupQuanItem(quanItem: cc.Node, quanData: any, isQuan1: boolean) {
        // Lấy các node con từ item prefab
        let colorSprite = quanItem.getChildByName("Sprite").getComponent(cc.Sprite);
        let infoLabel = quanItem.getChildByName("InfoLabel").getComponent(cc.Label);
        let skillLabel = quanItem.getChildByName("SkillLabel").getComponent(cc.Label);
        let selectButton = quanItem.getChildByName("SelectButton");

        // Thiết lập màu
        colorSprite.node.color = this.getColorFromString(quanData.color);

        // Thiết lập các chỉ số
        infoLabel.string = `${quanData.health}\n${quanData.damage}\n${quanData.armor}\n${quanData.speed}\n${quanData.critRate > 0 ? quanData.critRate : "---"}`
        
        skillLabel.string = " ";

        if (quanData.skills == null){
            skillLabel.string += "Vui lòng chọn quan";

            quanItem.color = cc.Color.WHITE;
        }
        else {
            let skills: EffectType[] = quanData.skills.map((skill: number) => skill as EffectType);
            skillLabel.string += skills.map(effect => this.getSkillStringFromEffectTypeString(EffectType[effect])).join("\n");
        
            quanItem.color = this.getColorFromLevel(quanData);
        }

        selectButton.off("click");

        if (isQuan1){
            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.deleteQuan1();
            });
        }
        else{
            // Thiết lập sự kiện cho nút chọn
            selectButton.on("click", () => {
                this.deleteQuan2();
            });
        }
        
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
            default:
                return "";
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

    protected onDestroy(): void {
        QuanMerge._instance = null;
    }
}