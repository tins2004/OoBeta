const { ccclass, property } = cc._decorator;
import { EffectType } from "./Effect";
import EffectBox from "./EffectBox";

@ccclass
export default class EffectContainer extends cc.Component {
    @property({ type: [cc.Prefab] })
    effectBoxPrefabs: cc.Prefab = null;

    @property
    spacing: number = 7;

    addEffect(effectType: EffectType, turns: number): cc.Node {
        let newEffect = cc.instantiate(this.effectBoxPrefabs);
        this.node.addChild(newEffect);
        
        let effectBox = newEffect.getComponent(EffectBox);
        if (effectBox) {
            effectBox.setIcon(effectType);
            effectBox.setTurns(turns);
        }
        
        this.rearrangeEffects();

        return newEffect;
    }

    rearrangeEffects() {
        let children = this.node.children;
        let totalHeight = 0;
        
        // Tính tổng chiều dài của các node con
        for (let i = 0; i < children.length; i++) {
            totalHeight += children[i].height + this.spacing;
        }
    
        totalHeight -= this.spacing;
    
        let startY = totalHeight / 2; // Bắt đầu từ phía trên
        for (let i = 0; i < children.length; i++) {
            children[i].y = startY - children[i].height / 2;
            startY -= children[i].height + this.spacing;
        }
    }
}