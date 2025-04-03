// SpecialCellData.ts
export enum SpecialCellEffectType {
    DAMAGE_BOOST, // Lâu đài - 0
    HEAL_BOOST, // Ruộng lúa - 1
    POISON_BOOST, // Rừng rậm - 2
    BURN_BOOST, // Núi lửa - 3
    WEAKNESS_BOOST, // Hồ băng - 4
    ATTACK_BOOST // Biển lớn - 5 
}

export default class SpecialCellData {
    effectType: SpecialCellEffectType;
    effectValue: number;
    // spriteFrame: cc.SpriteFrame; // Hình ảnh hiển thị (nếu cần)

    constructor(effectType: SpecialCellEffectType, effectValue: number, spriteFrame: cc.SpriteFrame = null) {
        this.effectType = effectType;
        this.effectValue = effectValue;
        // this.spriteFrame = spriteFrame;
    }

    getEffectTypeName(): string { 
        return SpecialCellEffectType[this.effectType];  
    }

    getEffectInformation(): string {
        switch (this.effectType) {
            case SpecialCellEffectType.DAMAGE_BOOST:
                return `Tăng thêm ${this.effectValue} sát thương\nlên kẻ thù trong lượt này.`;
            case SpecialCellEffectType.HEAL_BOOST:
                return `Hồi ${this.effectValue} máu\nngay lập tức.`;
            case SpecialCellEffectType.POISON_BOOST:
                return `Gây độc lên kẻ thù \n rút ${this.effectValue}% máu theo \nsát thương của kẻ thù \ntrong 1 lượt.`;
            case SpecialCellEffectType.BURN_BOOST:
                return `Gây cháy kẻ thù \nrút ${this.effectValue} máu trong 1 lượt.`;
            case SpecialCellEffectType.WEAKNESS_BOOST:
                return `Giảm ${this.effectValue}% sát thương\ncủa kẻ thù \ntrong lượt tiếp.`;
            case SpecialCellEffectType.ATTACK_BOOST:
                return `Đánh thêm một lần với\n${this.effectValue}% sát thương hiện tại.`;
        }
    }
}