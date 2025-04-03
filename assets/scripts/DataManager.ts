import { Gacha } from "./OAnQuan/Gacha/Gacha";

// DataManager.ts
const { ccclass, property } = cc._decorator;

@ccclass
export class DataManager extends cc.Component {
    private static _instance: DataManager | null = null;

    public static get instance(): DataManager {
        if (!this._instance) {
            this._instance = new DataManager();
            // Nếu bạn cần component trong scene, bạn có thể tìm hoặc tạo ở đây
            // cc.director.getScene().addComponent(DataManager);
        }
        return this._instance;
    }

    public walletAddress: any;

    public dataQuan: any[];
    public dataDien: any[];

    public selectionQuan: any;
    public selectionDien: any[];
    public selectionEnemy: any;


    private constructor() {
        super();
        // Để đảm bảo chỉ có một instance
        if (DataManager._instance) {
            throw new Error("Use DataManager.instance instead of new DataManager()");
        }
        DataManager._instance = this;
    }

    public gachaDien(){
        const dien = Gacha.rollDien();

        let dienData = {
            name: dien.name,
            info: dien.info,
            effect: dien.effect,
            stat: dien.stat
        }
        
        return dienData;
    }

    public gachaQuan(){
        const quan = Gacha.rollQuan();

        let quanData = {
            color: quan.color,
            health: Math.round(quan.health),
            damage: Math.round(quan.damage),
            armor: Math.round(quan.armor),
            speed: Math.round(quan.speed),
            critRate: quan.critRate ? parseFloat(quan.critRate.toFixed(2)) : 0,
            skills: quan.skills, // Giữ nguyên mảng effects
        };
        
        return quanData;
    }
}