import { SpecialCellEffectType } from "../SpecialCellData";

export class Dien {
    name: string;
    info: string;
    effect: SpecialCellEffectType;
    stat: number;

    constructor() {
        const types = [
            { name: "Lâu đài", 
                info: "Tăng thêm stat sức mạnh trong \nlượt này.", 
                effect: SpecialCellEffectType.DAMAGE_BOOST },
            { name: "Ruộng lúa", 
                info: "Hồi stat máu ngay lập tức.", 
                effect: SpecialCellEffectType.HEAL_BOOST },
            { name: "Rừng rậm", 
                info: "Gây độc lên kẻ thù với stat phần\ntrăm sát thương của kẻ thù.", 
                effect: SpecialCellEffectType.POISON_BOOST },
            { name: "Núi lửa", 
                info: "Đốt cháy kẻ thù với stat sát \nthương.", 
                effect: SpecialCellEffectType.BURN_BOOST },
            { name: "Hồ băng", 
                info: "Giảm stat sức mạnh của kẻ thù \ntrong 1 lượt.", 
                effect: SpecialCellEffectType.WEAKNESS_BOOST },
            { name: "Hải đăng", 
                info: "Đánh thêm một lần với \nstat phần trăm sát thương hiện tại.",
                effect: SpecialCellEffectType.ATTACK_BOOST }
        ];

        const selected = types[Math.floor(Math.random() * types.length)];
        this.name = selected.name;
        this.effect = selected.effect;
        switch (selected.effect){
            case SpecialCellEffectType.DAMAGE_BOOST:
            case SpecialCellEffectType.HEAL_BOOST:
            case SpecialCellEffectType.BURN_BOOST:
            case SpecialCellEffectType.WEAKNESS_BOOST:
                this.stat = this.randomStat(5, 25);
                break;
            case SpecialCellEffectType.POISON_BOOST:
            case SpecialCellEffectType.ATTACK_BOOST:
                this.stat = this.randomStat(0.1, 0.8);
                break;   
        }
        this.info = selected.info.replace("stat", this.stat.toString()); 
    }
    
    private randomStat(min: number, max: number): number {
        const random = Math.random() * (max - min) + min;
        if (random < 1)
            return parseFloat(random.toFixed(2));
        else{
            return Math.round(random);
        }
    }
}
