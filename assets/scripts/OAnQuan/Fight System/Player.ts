const { ccclass, property } = cc._decorator;
import Character from "./Character";
// import { Gacha } from "../Gacha/Gacha";
import { DataManager } from '../../DataManager';

@ccclass
export default class Player extends Character {

    onLoad() {
        return new Promise<void>((resolve) => {
            // const quan = Gacha.rollQuan();
            const quan = DataManager.instance.selectionQuan;
            
            this.characterName = quan.color;
            this.hp = Math.round(quan.health);
            this.damage = Math.round(quan.damage);
            this.armor = Math.round(quan.armor);
            this.speed = Math.round(quan.speed);
            this.critRate = quan.critRate ? parseFloat(quan.critRate) : 0;
            this.skills = quan.skills;
            this.node.color = quan.color;

            // this.characterName = "Player";
            // this.hp = 100;
            // this.damage = 20;
            // this.armor = 5;
            // this.speed = 10;
            // this.critRate = 0.1;
            
            this.animation = this.getComponent(cc.Animation);
            // this.informationLabel = this.getComponent(cc.Label);
            this.updateStatusLabel();
            
            super.onLoad();
            resolve();
        });
    }

    specialMove(target: Character, healingPoints: number, damagePoints: number) {
        this.dealDamage(target, damagePoints);
        this.healing(healingPoints);

        this.useSkill(target, this, 0.3);
    }
}
