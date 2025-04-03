const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    private static instance: GameManager = null;

    public isPlayerTurn: boolean = true; 
    public playerCanMove: boolean = true; 

    public static getInstance(): GameManager {
        if (!this.instance) {
            this.instance = new GameManager();
        }
        return this.instance;
    }

    setPlayerTurn(turn: boolean) {
        this.isPlayerTurn = turn;
    }

    setPlayerMoveState(turn: boolean) {
        this.playerCanMove = turn;
    }
}
