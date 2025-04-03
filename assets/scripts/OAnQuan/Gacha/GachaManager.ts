import { EffectType } from "../Fight System/Effect";
import { Gacha } from "./Gacha";
const { ccclass, property } = cc._decorator;

@ccclass("GachaManager")
export class GachaManager extends cc.Component {
    @property(cc.Label)
    quanLabel: cc.Label = null;

    @property(cc.Label)
    dienLabel: cc.Label = null;

    // protected onLoad(): void {
    //     let quanDataString = cc.sys.localStorage.getItem("QuanData");
    //     if (quanDataString) {
    //         let quanDataList = JSON.parse(quanDataString);
    //         quanDataList.forEach((quanData, index) => {
    //             // Chuyển đổi mảng số skills thành mảng EffectType
    //             let skills: EffectType[] = quanData.skills.map((skill: number) => skill as EffectType);

    //             console.log(`Quan: ${index} - ${quanData.color}, Máu: ${quanData.health}, Sát thương: ${quanData.damage}, Giáp: ${quanData.armor}, Chí mạng: ${quanData.critRate ? quanData.critRate : "null"}%, Hiệu ứng: ${skills.map(effect => EffectType[effect]).join(", ")}`);
    //         });
    //     }
    // }

    rollQuan() {
        const quan = Gacha.rollQuan();
    
        
        // Đọc dữ liệu JSON hiện có từ localStorage (nếu có)
        let quanListString = cc.sys.localStorage.getItem("QuanData");
        let quanList = quanListString ? JSON.parse(quanListString) : [];
        
        // Tạo đối tượng JavaScript chứa dữ liệu quan
        let quanData = {
            id: (quanList.length + 1),
            color: quan.color,
            health: Math.round(quan.health),
            damage: Math.round(quan.damage),
            armor: Math.round(quan.armor),
            speed: Math.round(quan.speed),
            critRate: quan.critRate ? parseFloat(quan.critRate.toFixed(2)) : 0,
            skills: quan.skills, // Giữ nguyên mảng effects
        };
        
        // Thêm quan mới vào mảng
        quanList.push(quanData);

        // Lưu mảng đã cập nhật vào localStorage
        cc.sys.localStorage.setItem("QuanData", JSON.stringify(quanList));

        console.log(`Đã lưu ${quanData.color} vào danh sách.`);
    
        // Hiển thị dữ liệu quan trên label (nếu cần)
        this.quanLabel.string = `Quan: ${quan.color}, Máu: ${quan.health.toFixed(2)}, Sát thương: ${quan.damage.toFixed(2)}, Giáp: ${quan.armor.toFixed(2)}, Chí mạng: ${quan.critRate ? quan.critRate.toFixed(2) : "null"}%, Hiệu ứng: ${quan.skills.map(effect => EffectType[effect]).join(", ")}`;
    }

    rollDien() {
        const dien = Gacha.rollDien();

        // Đọc dữ liệu JSON hiện có từ localStorage (nếu có)
        let dienListString = cc.sys.localStorage.getItem("DienData");
        let dienList = dienListString ? JSON.parse(dienListString) : [];

        let dienData = {
            id: (dienList.length + 1),
            name: dien.name,
            info: dien.info,
            effect: dien.effect,
            stat: dien.stat
        }

        // Thêm quan mới vào mảng
        dienList.push(dienData);

        // Lưu mảng đã cập nhật vào localStorage
        cc.sys.localStorage.setItem("DienData", JSON.stringify(dienList));

        console.log(`Đã lưu ${dienData.name} vào danh sách.`);

        this.dienLabel.string = `Điền: ${dien.name}, Info: ${dien.info}, Effect: ${dien.effect}, Stat: ${dien.stat}`;
    }

    clear(){
        console.warn("Xóa dữ liệu")
        // cc.sys.localStorage.removeItem("quanList");
        cc.sys.localStorage.clear();
    }
}
