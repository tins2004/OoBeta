import BoardManager from "../BoardManager";
import GameManager from "../GameManager";
import FightManager from "./FightManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(FightManager)
    fightManager: FightManager = null;

    @property(BoardManager)
    boardManager: BoardManager = null;

    @property(GameManager)
    gameManager: GameManager = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    // start () {

    // }

    // update (dt) {}
}
