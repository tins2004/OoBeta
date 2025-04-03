const { ccclass, property } = cc._decorator;
import Cell from "./Cell"; 
import BoardManager from "./BoardManager"; 
import GameManager from "./GameManager";

@ccclass
export default class AIManager extends cc.Component {
    board: cc.Node[] = [];

    onLoad() {
        cc.systemEvent.on("START_AI_TURN", this.playTurn, this);
    }

    playTurn() {
        console.log("AI đang suy nghĩ...");
        GameManager.getInstance().setPlayerMoveState(false);

        this.board = BoardManager.getInstance().cells;
        // Lấy danh sách ô từ 7 đến 11
        let possibleMoves = this.board.slice(7, 12).map(cell => cell.getComponent('Cell'));
        let bestMove = this.chooseBestMove(possibleMoves);
        
        if (bestMove) {
            console.log(`AI chọn ô ${bestMove.index} sang ${bestMove.index % 2 === 0 ? " sang trái " : "sang phải"}`);
            bestMove.move(bestMove.index % 2 === 0 ? -1 : 1, () => {
                console.log("AI hoàn thành lượt đi!");
                cc.systemEvent.emit("AI_ENDED_TURN");
            });
        }
    }

    chooseBestMove(possibleMoves: Cell[]): Cell | null {
        let bestCell = null;
        let maxPotentialGain = 0;

        possibleMoves.forEach(cell => {
            let gain = this.evaluateMove(cell);
            if (gain > maxPotentialGain) {
                maxPotentialGain = gain;
                bestCell = cell;
            }
        });

        if (!bestCell){
            possibleMoves.forEach(cell => {
                let gain = cell.getNumberOfSoldiers();
                if (gain > maxPotentialGain) {
                    maxPotentialGain = gain;
                    bestCell = cell;
                }
            });
        }

        return bestCell;
    }

    evaluateMove(cell: Cell): number {
        let index = cell.index;
        let leftScore = this.simulateMove(index, -1);
        let rightScore = this.simulateMove(index, 1);

        return Math.max(leftScore, rightScore);
    }

    simulateMove(index: number, direction: number): number {
        let simulatedBoard = this.board.map(cell => cell.getComponent('Cell').getNumberOfSoldiers());
        let stones = simulatedBoard[index];

        if (stones === 0) return 0;

        simulatedBoard[index] = 0;
        let pos = index;

        while (stones > 0) {
            pos = (pos + direction + simulatedBoard.length) % simulatedBoard.length;
            simulatedBoard[pos]++;
            stones--;
        }

        return simulatedBoard[0] + simulatedBoard[6];
    }
}
