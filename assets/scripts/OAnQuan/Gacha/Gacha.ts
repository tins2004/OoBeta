import { Quan } from "./Quan";
import { Dien } from "./Dien";

export class Gacha {
    static rollQuan(): Quan {
        return new Quan();
    }

    static rollDien(): Dien {
        return new Dien();
    }
}
