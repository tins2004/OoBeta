import { EffectType } from "../Fight System/Effect";
import { SpecialCellEffectType } from "../SpecialCellData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DienMerge extends cc.Component {

    private static _instance: DienMerge = null;

    public static get instance(): DienMerge {
        if (!this._instance) {
            console.error("QuanMerge instance is not initialized yet!");
        }
        return this._instance;
    }

    @property({ type: cc.Node, tooltip: 'Nút Log Merge' })
    logMergeButton: cc.Node = null;

    @property(cc.Node)
    dienItem: cc.Node[] = [];

    @property([cc.SpriteFrame])
    cellSprites: cc.SpriteFrame[] = [];

    public selectedDienMerge: any[] = []; 
    public selectedDienButtonLabel: cc.Label[] = []; 

    protected onLoad(): void {
        if (!DienMerge._instance) {
            DienMerge._instance = this;
            // cc.game.addPersistRootNode(this.node); // Giữ node này tồn tại giữa các scene
        } else {
            this.destroy(); // Nếu đã có instance, hủy node hiện tại
        }

        if (this.logMergeButton) {
            this.logMergeButton.on('click', this.quanMerge, this);
        }

        this.updateDisplay(); // Cập nhật hiển thị ban đầu
    }


    public selectQuan(dienData: any, quanButtonLabel: cc.Label): boolean {
        // Kiểm tra xem dienData.id đã tồn tại trong selectedDienMerge chưa
        const isAlreadySelected = this.selectedDienMerge.some(selectedQuan => selectedQuan && selectedQuan.id === dienData.id);
    
        if (isAlreadySelected) {
            console.log(`Quan với ID ${dienData.id} đã được chọn.`);
            return false; // Không thêm nếu đã được chọn
        }
    
        if (this.selectedDienMerge.length < 2 && this.selectedDienMerge.length < 2) {
            this.selectedDienMerge.push(dienData);
            this.selectedDienButtonLabel.push(quanButtonLabel);
            this.updateDisplay();
            // console.log(`Đã chọn Quan ${dienData.id}. Tổng số Quan đã chọn: ${this.selectedDienMerge.length}`);
            return true;
        } else {
            console.log("Đã chọn đủ 2 Quan. Không thể chọn thêm.");
            return false;
        }
    }

    private deleteQuan1(): void {
        if (this.selectedDienMerge.length > 0) {
            this.selectedDienButtonLabel[0].string = `Chọn: ${this.selectedDienMerge[0].id}`;

            this.selectedDienMerge.splice(0, 1); // Xóa phần tử thứ hai
            this.selectedDienButtonLabel.splice(0, 1); // Xóa phần tử đầu tiên
            this.updateDisplay();
            // console.log("Đã xóa Quan 1.");
        } else {
            console.log("Chưa có Quan 1 để xóa.");
        }
    }

    private deleteQuan2(): void {
        if (this.selectedDienMerge.length > 1) {
            this.selectedDienButtonLabel[1].string = `Chọn: ${this.selectedDienMerge[1].id}`;

            this.selectedDienMerge.splice(1, 1); // Xóa phần tử thứ hai
            this.selectedDienButtonLabel.splice(1, 1); // Xóa phần tử thứ hai
            this.updateDisplay();
            // console.log("Đã xóa Quan 2.");
        } else {
            console.log("Chưa có Quan 2 để xóa.");
        }
    }

    private quanMerge(): void {
        if (this.selectedDienMerge.length === 2) {
            console.log("Thông tin 2 Quan đã chọn:");
            console.log("Quan 1:", this.selectedDienMerge[0]);
            console.log("Quan 2:", this.selectedDienMerge[1]);
        } else {
            console.log("Chưa có Quan nào được chọn.");
        }
    }

    private updateDisplay(): void {
        if (this.dienItem.length < 2) return;

        let dienDataNull = {
            id: null,
            name: "Điền",
            info: "Vui lòng chọn điền.",
            damage: 0,
            armor: 0,
            speed: 0,
            critRate: 0,
            skills: null,
        };

        if (this.selectedDienMerge[0] != null)
            this.setupDienItem(this.dienItem[0], this.selectedDienMerge[0], true);
        else
            this.setupDienItem(this.dienItem[0], dienDataNull, true);

        if (this.selectedDienMerge[1] != null)
            this.setupDienItem(this.dienItem[1], this.selectedDienMerge[1], false);
        else
            this.setupDienItem(this.dienItem[1], dienDataNull, false);
    }   

    setupDienItem(dienItem: cc.Node, dienData: any, isQuan1: boolean) {
        // Lấy các node con từ item prefab
        let dienSprite = dienItem.getChildByName("Sprite").getComponent(cc.Sprite);
        let infoLabel = dienItem.getChildByName("InfoLabel").getComponent(cc.Label);
        let nameLabel = dienItem.getChildByName("NameLabel").getComponent(cc.Label);
        let selectButton = dienItem.getChildByName("SelectButton");

        nameLabel.string = dienData.name;
        infoLabel.string = dienData.info;

        dienSprite.spriteFrame = this.getSpriteFromEffectType(dienData.effect);

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
            default:
                return this.cellSprites[6];  //base
        }
    }

    protected onDestroy(): void {
        DienMerge._instance = null;
    }
}