const { ccclass, property } = cc._decorator;
import { EffectType } from "./Effect"; // Thêm import

@ccclass
export default class EffectBox extends cc.Component {
    @property(cc.Sprite)
    iconEffect: cc.Sprite = null;

    @property(cc.Label)
    turnsLabel: cc.Label = null;

    @property([cc.SpriteFrame])
    effectSprites: cc.SpriteFrame[] = [];

    setIcon(effectType: EffectType) {
        switch (effectType) {
            case EffectType.STUN: // 0
                this.iconEffect.spriteFrame = this.effectSprites[0];
                break;
            case EffectType.BURN: // 1
                this.iconEffect.spriteFrame = this.effectSprites[1];
                break;
            case EffectType.DEBUFF_ARMOR: // 2
                this.iconEffect.spriteFrame = this.effectSprites[2];
                break;
            case EffectType.WEAKNESS: // 3
                this.iconEffect.spriteFrame = this.effectSprites[3];
                break;
            case EffectType.SLOW: // 4
                this.iconEffect.spriteFrame = this.effectSprites[4];
                break;
            case EffectType.CONFUSION: // 5
                this.iconEffect.spriteFrame = this.effectSprites[5];
                break;
            case EffectType.POISON: // 6
                this.iconEffect.spriteFrame = this.effectSprites[6];
                break;
            case EffectType.STRENGTH: // 7
                this.iconEffect.spriteFrame = this.effectSprites[7];    
                break;
            case EffectType.TOUGHNESS: // 8
                this.iconEffect.spriteFrame = this.effectSprites[8];
                break;
            case EffectType.AGILITY: // 9
                this.iconEffect.spriteFrame = this.effectSprites[9];
                break;
            case EffectType.FOCUS: // 10
                this.iconEffect.spriteFrame = this.effectSprites[10];
                break;
            case EffectType.BLOCK: // 11
                this.iconEffect.spriteFrame = this.effectSprites[11];
                break;
        }
    }

    setTurns(turns: number) {
        this.turnsLabel.string = turns.toString();
    }
}