const { ccclass, property } = cc._decorator;
import Character from "./Character";
import Effect, { EffectType } from "./Effect";
import { DataManager } from '../../DataManager';

@ccclass
export default class AI extends Character {
    onLoad() {
        return new Promise<void>((resolve) => {
            const AI = DataManager.instance.selectionEnemy;

            // this.characterName = "Thần ";
            // this.characterName = "Thần đèn";
            // this.characterName = "Bùn tinh";
            // this.characterName = "Xà nữ";
            this.characterName = AI.name;
            this.hp = AI.health;
            this.damage = AI.damage;
            this.armor = AI.armor;
            this.speed = AI.speed;
            this.critRate = AI.critRate;

            this.skills = AI.skills;

            // this.informationLabel = this.getComponent(cc.Label);
            this.animation = this.getComponent(cc.Animation);
            this.playAnimation(0);
            this.updateStatusLabel();
            
            super.onLoad();
            resolve(); // Giải quyết Promise khi hoàn thành
        });
    }   

    aiTurn(target: Character, healingPoints: number, damagePoints: number) {
        this.dealDamage(target, damagePoints);
        this.healing(healingPoints);

        this.useSkill(target, this, 0.3);
    }
}