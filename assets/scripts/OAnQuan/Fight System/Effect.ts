import Character from "./Character";

export enum EffectType {
    STUN,       // Gây choáng - 0
    BURN,       // Gây bỏng - 1
    DEBUFF_ARMOR, // Phá giáp - 2
    WEAKNESS,    // Yếu đuối - 3
    SLOW,        // Chậm chạp - 4
    CONFUSION,   // Bối rối -  5
    POISON,      // Độc - 6
    // BLIND,       // Mù 
    STRENGTH,    // Mạnh mẽ - 7
    TOUGHNESS,   // Cứng rắn - 8
    AGILITY,     // Nhanh nhẹn - 9
    FOCUS,       // Tập trung - 10
    BLOCK,       // Chặn - 11
    // LUCK,        // May mắn
}


export default class Effect {
    type: EffectType;
    turnsLeft: number; // Số lượt tồn tại
    value: number; // Giá trị của hiệu ứng (X)

    constructor(type: EffectType, turns: number, value: number) {
        this.type = type;
        this.turnsLeft = turns;
        this.value = value;
    }

    applyEffect(character: Character) {
        switch (this.type) {
            case EffectType.STUN: // 0
                character.canAct = false;
                break;
            case EffectType.BURN: // 1
                character.burnDamage = this.value;
                break;
            case EffectType.DEBUFF_ARMOR: // 2
                character.armor -= this.value;
                break;
            case EffectType.WEAKNESS: // 3
                character.damage -= this.value;
                break;
            case EffectType.SLOW: // 4
                character.speed -= this.value;
                break;
            case EffectType.CONFUSION: // 5
                character.critRate -= this.value;
                break;
            case EffectType.POISON: // 6
                character.poisonDamagepPercent = this.value;
                break;
            // case EffectType.BLIND: 
            //     character.blinded = true;
            //     break;
            case EffectType.STRENGTH: // 7
                character.damage += this.value;
                break;
            case EffectType.TOUGHNESS: // 8
                character.armor += this.value;
                break;
            case EffectType.AGILITY: // 9
                character.speed += this.value;
                break;
            case EffectType.FOCUS: // 10
                character.critRate += this.value;
                break;
            case EffectType.BLOCK: // 11
                character.blocked = true;
                break;
            // case EffectType.LUCK: 
            //     // Triển khai logic may mắn (tạo hiệu ứng ngẫu nhiên)
            //     break;
        }
    }

    removeEffect(character: Character) {
        switch (this.type) {
            case EffectType.DEBUFF_ARMOR: // 2
                character.armor += this.value;
                break;
            case EffectType.WEAKNESS: // 3
                character.damage += this.value;
                break;
            case EffectType.SLOW: // 4
                character.speed += this.value;
                break;
            case EffectType.CONFUSION: // 5
                character.critRate += this.value;
                break;
            case EffectType.POISON: // 6
                character.poisonDamagepPercent = 0;
                break;
            case EffectType.BURN: // 1
                character.burnDamage = 0;
                break;
            // case EffectType.BLIND: // 
            //     character.blinded = false;
            //     break;
            case EffectType.STRENGTH: // 7
                character.damage -= this.value;
                break;
            case EffectType.TOUGHNESS: // 8
                character.armor -= this.value;
                break;
            case EffectType.AGILITY: // 9
                character.speed -= this.value;
                break;
            case EffectType.FOCUS: // 10
                character.critRate -= this.value;
                break;
            case EffectType.BLOCK: // 11
                character.blocked = false;
                break;
        }
        character.canAct = true; // 0
    }
}