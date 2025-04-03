import { EffectType } from "../Fight System/Effect";

enum QuanLevel {
    Soi = "Cấp 1: Sỏi",
    Da = "Cấp 2: Đá",
    DaQuy = "Cấp 3: Đá quý",
    KhongXacDinh = "Cấp 4: Không xác định"
}

enum StatDistribution {
    Balanced = "Chỉ số gần bằng nhau",
    HighOne = "1-2 chỉ số cao vọt, còn lại thấp",
    MidOne = "1-2 chỉ số cao vừa, còn lại thấp vừa",
    LowOne = "1-2 chỉ số thấp, còn lại cao",
    LowMid = "1-2 chỉ số thấp vừa, còn lại cao vừa"
}

const LevelProbabilities = {
    [QuanLevel.Soi]: 50,
    [QuanLevel.Da]: 30,
    [QuanLevel.DaQuy]: 15,
    [QuanLevel.KhongXacDinh]: 5
};

const StatProbabilities = {
    [StatDistribution.Balanced]: 30,
    [StatDistribution.HighOne]: 25,
    [StatDistribution.MidOne]: 20,
    [StatDistribution.LowOne]: 15,
    [StatDistribution.LowMid]: 10
};


export class Quan {
    level: QuanLevel;
    distribution: StatDistribution;
    color: string;
    health: number;
    damage: number;
    armor: number;
    speed: number;
    critRate?: number;
    skills: EffectType[];

    constructor() {
        this.level = this.getRandomLevel();
        this.distribution = this.getRandomStatDistribution();

        const colors = ["yellow", "pink", "blue", "aqua", "green", "brown"];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.skills = [];
        this.generateStats();
        this.applyLevelBonuses();
    }

    private generateStats() {
        const baseValues = {
            health: this.randomInRange(50, 100),
            damage: this.randomInRange(10, 50),
            armor: this.randomInRange(5, 35),
            speed: this.randomInRange(5, 35)
        };
    
        let stats = Object.values(baseValues);

        switch (this.distribution) {
            case StatDistribution.Balanced:
                break;
            case StatDistribution.HighOne:
                stats = this.modifyStats(stats, 2, "high");
                break;
            case StatDistribution.MidOne:
                stats = this.modifyStats(stats, 2, "mid");
                break;
            case StatDistribution.LowOne:
                stats = this.modifyStats(stats, 2, "low");
                break;
            case StatDistribution.LowMid:
                stats = this.modifyStats(stats, 2, "lowMid");
                break;
        }

        [this.health, this.damage, this.armor, this.speed] = stats;
    }

    private modifyStats(stats: number[], count: number, type: string): number[] {
        const indexes = this.shuffleArray([0, 1, 2, 3]).slice(0, count);
        for (const i of indexes) {
            if (type === "high") stats[i] *= this.randomInRange(1.4, 1.7);
            if (type === "mid") stats[i] *= this.randomInRange(1.1, 1.3);
            if (type === "low") stats[i] *= this.randomInRange(0.4, 0.6);
            if (type === "lowMid") stats[i] *= this.randomInRange(0.7, 0.9);
        }
        return stats;
    }

    private applyLevelBonuses() {
        if (this.level === QuanLevel.Da) {
            this.skills.push(this.getRandomEffect());
        } else if (this.level === QuanLevel.DaQuy) {
            this.skills.push(this.getRandomEffect());
            this.critRate = Math.random() * 30;
        } else if (this.level === QuanLevel.KhongXacDinh) {
            this.skills.push(this.getRandomEffect(), this.getRandomEffect(), this.getRandomEffect());
            this.critRate = Math.random() * 30;
        }
    }

    private randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private shuffleArray<T>(array: T[]): T[] {
        return array.sort(() => Math.random() - 0.5);
    }

    private getRandomEffect(): EffectType {
        const allEffects = Object.values(EffectType).filter(value => typeof value === "number") as EffectType[];
        return allEffects[Math.floor(Math.random() * allEffects.length)];
    }

    private getRandomLevel(): QuanLevel {
        return this.weightedRandom(LevelProbabilities);
    }

    private getRandomStatDistribution(): StatDistribution {
        return this.weightedRandom(StatProbabilities);
    }
    
    private weightedRandom<T extends string | number>(probabilities: Record<T, number>): T {
        const total = (Object.values(probabilities) as number[]).reduce((a, b) => a + b, 0);
        const rand = Math.random() * total;
        let sum = 0;
    
        for (const key in probabilities) {
            sum += probabilities[key];
            if (rand < sum) return key as T;
        }
    
        return Object.keys(probabilities)[0] as T; // Trả về giá trị đầu tiên nếu có lỗi
    }
}
