const { ccclass, property } = cc._decorator;
import Effect, { EffectType } from "./Effect";
import SpecialCellData, { SpecialCellEffectType } from "../SpecialCellData";
import EffectContainer from "./EffectContainer";
import EffectBox from "./EffectBox";

@ccclass
export default class Character extends cc.Component {
    @property
    characterName: string = "Character";

    @property
    hp: number = 100;

    @property
    damage: number = 10;

    @property
    armor: number = 5;

    @property
    speed: number = 10;

    @property
    critRate: number = 0.1;

    @property(cc.Node)
    moveEffect: cc.Node = null;

    @property(cc.Label)
    statusLabel: cc.Label[] = [];

    @property(cc.Label)
    informationLabel: cc.Label = null;

    @property(cc.Label)
    floatingLabel: cc.Label = null;

    @property(cc.Node)
    effectContainerNode: cc.Node = null;

    animation: cc.Animation = null; // 0: Idle, 1: Attack, 2: Die, 3: Hit

    skills: EffectType[] = [];
    effects: Effect[] = [];
    effectBoxMap: Map<Effect, cc.Node> = new Map();
    canAct: boolean = true;
    poisonDamagepPercent: number = 0;
    burnDamage: number = 0;
    // blinded: boolean = false;
    blocked: boolean = false;

    currentSpecialCellEffect: SpecialCellData = null; // Hiệu ứng ô đất đặc biệt hiện tại

    private messageQueue: string[] = [];
    private isDisplayingMessage = false;

    onLoad() {
        console.log(`${this.characterName} đã sẵn sàng!`);
        if (this.floatingLabel) this.floatingLabel.node.active = false;
    }

    async showTemporaryMessage(message: string) {
        this.messageQueue.push(message);

        if (!this.isDisplayingMessage) {
            this.isDisplayingMessage = true;

            while (this.messageQueue.length > 0) {
                let msg = this.messageQueue.shift();
                this.floatingLabel.string = msg;
                this.floatingLabel.node.active = true;

                await this.sleep(0.5);
            }

            this.floatingLabel.node.active = false;
            this.isDisplayingMessage = false;
        }
    }

    sleep(seconds: number) {
        return new Promise(resolve => this.scheduleOnce(resolve, seconds));
    }

    takeDamage(amount: number, mess: string = "") {
        if (this.blocked) {
            this.showTemporaryMessage("Chặn!");
    
            // Loại bỏ tất cả hiệu ứng BLOCK ngay lập tức
            this.effects = this.effects.filter(effect => {
                if (effect.type === EffectType.BLOCK) {
                    // Nếu có node hiệu ứng trên UI, hãy loại bỏ nó
                    let nodeEffect = this.effectBoxMap.get(effect)?.getComponent(EffectBox);
                    if (nodeEffect) {
                        nodeEffect.node.destroy();
                    }
                    // console.log(`Đã loại bỏ hiệu ứng BLOCK của ${this.characterName} do chặn.`);
                    return false; // Loại bỏ hiệu ứng BLOCK khỏi mảng
                }
                return true; // Giữ lại các hiệu ứng khác
            });
            this.effectBoxMap = new Map(this.effects.map(effect => [effect, this.effectBoxMap.get(effect)])); // Cập nhật lại map
    
            this.blocked = false; // Đặt lại trạng thái blocked sau khi chặn
            this.updateStatusLabel();
            return;
        }

        this.playAnimation(3);

        let reducedDamage = amount - this.armor;
        reducedDamage = Math.max(reducedDamage, 1);
        this.hp -= reducedDamage;

        if (this.hp <= 0) {
            this.hp = 0;
            this.playAnimation(2);
        }

        this.showTemporaryMessage(`${mess}-${reducedDamage} HP`);
        this.updateStatusLabel();
    }

    healing(healingPoints: number) {
        if (healingPoints <= 0) {
            return;
        }

        let finalHealing = healingPoints * (this.damage / 2);
        if (healingPoints > 15)
            finalHealing = healingPoints

        this.hp += finalHealing;
        this.showTemporaryMessage(`+${finalHealing} HP`);
        this.updateStatusLabel();
    }

    canDodge(attacker: Character): boolean {
        // if (this.blinded) return true;

        let dodgeRate = this.speed / (attacker.speed + this.speed);
        return Math.random() < dodgeRate;
    }

    dealDamage(target: Character, damagePoints: number) {
        if (!this.canAct) {
            this.showTemporaryMessage(`Không thể tấn công!`);
            return;
        }
        
        if (damagePoints <= 0) {
            return;
        }

        this.playAnimation(1);

        if (target.canDodge(this)) {
            target.showTemporaryMessage("Tránh né!");
            return;
        }
        
        let isCrit = Math.random() < this.critRate;
        let finalDamage = damagePoints * (isCrit ? this.damage * 2 : this.damage);

        if (isCrit) {
            this.showTemporaryMessage("Chí mạng!");
        }

        target.takeDamage(finalDamage);
    }

    useSkill(target: Character, self: Character, rate: number, value: number = this.damage) {
        for (let i = 0; i < this.skills.length; i++) {
            if (Math.random() < rate) {
                let effectTarget: Character;
                let effectTurns: number;
    
                // Xác định target và targetType dựa trên skill
                switch (this.skills[i]) {
                    case EffectType.STRENGTH:
                    case EffectType.TOUGHNESS:
                    case EffectType.AGILITY:
                    case EffectType.FOCUS:
                    case EffectType.BLOCK:
                        effectTarget = self; // Tác động lên bản thân
                        effectTurns = 2;
                        break;
                    default:
                        effectTarget = target; // Tác động lên đối thủ
                        effectTurns = 1;
                        break;
                }
    
                let effect = new Effect(this.skills[i], effectTurns, value);
                console.log(`${this.characterName} sử dụng ${EffectType[this.skills[i]]} lên ${effectTarget.characterName}!`);
                effectTarget.showTemporaryMessage("Nhận hiệu ứng!");
                effectTarget.applyEffect(effect);
            }
        }
    }

    applyEffect(effect: Effect) {
        let existingEffect = this.effects.find(e => e.type === effect.type);
    
        if (existingEffect) {
            // Hiệu ứng tương tự đã tồn tại, cộng dồn lượt và giá trị
            existingEffect.turnsLeft += effect.turnsLeft;
            existingEffect.value = effect.value;
            
            let nodeEffect = this.effectBoxMap.get(existingEffect).getComponent(EffectBox);
            if (nodeEffect)
                nodeEffect.setTurns(existingEffect.turnsLeft);
                
            console.log(`${this.characterName} cộng dồn hiệu ứng ${EffectType[effect.type]}. Tổng lượt: ${existingEffect.turnsLeft}, Tổng giá trị: ${existingEffect.value}`);
                
        } else {
            // Hiệu ứng chưa tồn tại, thêm hiệu ứng mới
            this.effects.push(effect);
            effect.applyEffect(this);
            
            // Gọi hàm addEffect từ EffectContainer
            if (this.effectContainerNode) {
                let effectContainer = this.effectContainerNode.getComponent(EffectContainer);
                if (effectContainer) {
                    // effectContainer.addEffect(effect.type, effect.turnsLeft); // Truyền EffectType và turns
                    let newEffectNode = effectContainer.addEffect(effect.type, effect.turnsLeft); // Lấy node trả về
                    if (newEffectNode) {
                        newEffectNode.getComponent(EffectBox).setIcon(effect.type);
                        this.effectBoxMap.set(effect, newEffectNode);   
                    }
                }
            }
            
            console.log(`${this.characterName} bị hiệu ứng ${EffectType[effect.type]} trong ${effect.turnsLeft} lượt.`);
        }
    
        this.updateStatusLabel();
    }

    useSpecialCell(specialCellData: SpecialCellData, target: Character) {
        switch (specialCellData.effectType) {
            case SpecialCellEffectType.DAMAGE_BOOST:
                this.damage += specialCellData.effectValue;
                break;
            case SpecialCellEffectType.HEAL_BOOST:
                // this.showTemporaryMessage(`Hồi máu`);
                this.healing(specialCellData.effectValue);
                break;
            case SpecialCellEffectType.POISON_BOOST:
                let effectPOISON = new Effect(EffectType.POISON, 1, specialCellData.effectValue);
                // console.log(`${this.characterName} gây độc lên ${target.characterName}!`);
                target.showTemporaryMessage("Bị độc!");
                target.applyEffect(effectPOISON);
                break;
            case SpecialCellEffectType.BURN_BOOST:
                let effectBURN = new Effect(EffectType.BURN, 1, specialCellData.effectValue);
                // console.log(`${this.characterName} gây độc lên ${target.characterName}!`);
                target.showTemporaryMessage("Bị bỏng!");
                target.applyEffect(effectBURN);
                break;
            case SpecialCellEffectType.WEAKNESS_BOOST:
                let effectWEAKNESS = new Effect(EffectType.WEAKNESS, 1, specialCellData.effectValue);
                // console.log(`${this.characterName} gây độc lên ${target.characterName}!`);
                target.showTemporaryMessage("Bị giảm sát thương!");
                target.applyEffect(effectWEAKNESS);
                break;
            case SpecialCellEffectType.WEAKNESS_BOOST:
                this.takeDamage((this.damage + this.damage*specialCellData.effectValue), "Đánh X2: ");
                break;
        }

        this.currentSpecialCellEffect = specialCellData; // Lưu trữ hiệu ứng đang áp dụng
    }

    endTurn() {
        this.effects.forEach(effect => {
            
            if (effect.turnsLeft > 0)
                switch (effect.type){
                    case EffectType.BURN:
                        // console.warn("Gây bỏng lên ", this.burnDamage)
                        this.takeDamage(this.burnDamage, "Bỏng: ");
                        break;
                    case EffectType.POISON:
                        // console.warn("Gây độc lên ", this.poisonDamagepPercent * this.damage)
                        this.takeDamage(this.poisonDamagepPercent * this.damage, "Độc: ");
                        break;
                }
                
            effect.turnsLeft--;
            
            let nodeEffect = this.effectBoxMap.get(effect).getComponent(EffectBox);
            if (nodeEffect)
                nodeEffect.setTurns(effect.turnsLeft);
            
        });
    
        this.effects = this.effects.filter(effect => {
            if (effect.turnsLeft <= 0) {
                effect.removeEffect(this);

                let nodeEffect = this.effectBoxMap.get(effect).getComponent(EffectBox);
                if (nodeEffect)
                    nodeEffect.node.destroy();

                console.log(`Hiệu ứng ${EffectType[effect.type]} của ${this.characterName} đã hết.`);
                return false;
            }
            return true;
        });

        // Loại bỏ hiệu ứng ô đất đặc biệt
        if (this.currentSpecialCellEffect) {
            switch (this.currentSpecialCellEffect.effectType) {
                case SpecialCellEffectType.DAMAGE_BOOST:
                    this.damage -= this.currentSpecialCellEffect.effectValue;
                    break;
            }
            this.currentSpecialCellEffect = null;
        }
    
        this.updateStatusLabel();
    }

    playAnimation(indexClip: number) {
        // 0: Idle, 1: Attack, 2: Die,  3: Hit
        // 0: Player, 1: tiểu quỷ, 2: thần đèn, 3: bùn tinh, 4: xà nữ
        let indexClipIdle = 0;
        switch (this.characterName){
            case "Thần đèn":
                indexClip += 4;
                indexClipIdle += 4;
                break;
            case "Bùn tinh":
                indexClip += 8;
                indexClipIdle += 8;
                break;
            case "Xà nữ":
                indexClip += 12;
                indexClipIdle += 12;
                break;
        }

        this.animation.play(this.animation.getClips()[indexClip].name); 
        // console.log(indexClip)
        
        if (indexClip === 2 || indexClip === 6 || indexClip === 10 || indexClip === 14) {
            this.animation.off('finished');
        } else {
            this.animation.once('finished', () => { // Sử dụng 'once' thay vì 'on'
                // Phát animation clip thứ 0
                this.animation.play(this.animation.getClips()[indexClipIdle].name);
            }, this);
        }
    }

    
    updateStatusLabel() {
        if (this.informationLabel) {
            // let effectText = this.effects.map(e => `${EffectType[e.type]}(${e.turnsLeft})`).join(", ");
            // let skillText = this.skills.map(effect => EffectType[effect]).join(", ");
            // this.informationLabel.string = `${this.characterName} - HP: ${this.hp} - Dame: ${this.damage} - Armor: ${this.armor} - Speed: ${this.speed} - CritRate: ${this.critRate}` +
            // (skillText ? ` - Kỹ năng: ${skillText}` : "") + (effectText ? ` - Hiệu ứng: ${effectText}` : "");
            this.informationLabel.string = "";
        }

        if (this.statusLabel.length < 5)
            return;

        this.statusLabel[0].string = `${this.hp > 0 ? this.hp : 0}`;
        this.statusLabel[1].string = `${this.damage > 0 ? this.damage : 0}`;
        this.statusLabel[2].string = `${this.armor > 0 ? this.armor : 0}`;
        this.statusLabel[3].string = `${this.speed > 0 ? this.speed : 0}`;
        this.statusLabel[4].string = `${this.critRate > 0 ? this.critRate.toFixed(2) : 0}%`;
    }

    updateSolidersLabel(numberOfSoldiers: number) {
        if (this.statusLabel.length < 6)
            return;

        this.statusLabel[5].string = `${numberOfSoldiers}`;
    }
}