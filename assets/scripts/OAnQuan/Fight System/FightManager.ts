const { ccclass, property } = cc._decorator;
import GameManager from "../GameManager";
import BoardManager from "../BoardManager";
import SpecialCellData, { SpecialCellEffectType } from "../SpecialCellData";
// import { Gacha } from "../Gacha/Gacha";
import { DataManager } from '../../DataManager';

import Player from "./Player";
import AI from "./AI";

@ccclass
export default class FightManager extends cc.Component {
    @property(cc.Label)
    turnName: cc.Label = null;

    @property(Player)
    player: Player = null;

    @property(AI)
    ai: AI = null;

    @property(cc.Button)
    goHomeButton: cc.Button = null;

    selectedSpecialCell: SpecialCellData[] = [
        // new SpecialCellData(SpecialCellEffectType.DAMAGE_BOOST, 5),
        // new SpecialCellData(SpecialCellEffectType.HEAL_BOOST, 500),
        // new SpecialCellData(SpecialCellEffectType.POISON_BOOST, 0.5),
        // new SpecialCellData(SpecialCellEffectType.BURN_BOOST, 5),
        // new SpecialCellData(SpecialCellEffectType.ATTACK_BOOST, 5),
        // new SpecialCellData(SpecialCellEffectType.WEAKNESS_BOOST, 0.5),
    ];

    async onLoad() {
        this.goHomeButton.node.on("click", () => {
            setTimeout(() => {
                cc.director.loadScene("Home Menu");
            }, 1000);
        });

        await Promise.all([this.player.onLoad(), this.ai.onLoad()]); // Đợi cả hai onLoad hoàn thành

        cc.systemEvent.on("PLAYER_TURN_ENDED", () => this.updateCells(true), this);
        cc.systemEvent.on("AI_ENDED_TURN", () => this.updateCells(false), this);

        this.addSpecialCell();

        this.setupSpecialCells();
        this.checkFirstGo();
    }

    addSpecialCell(){
        const diens = DataManager.instance.selectionDien; 

        if (!diens) return;

        diens.forEach((dien) => {
            this.selectedSpecialCell.push(new SpecialCellData(dien.effect, dien.stat));
        });
    }

    checkFirstGo() {
        // console.log(this.player.speed, this.ai.speed)
        if (this.player.speed > this.ai.speed) {
            this.turnName.string = "Lượt của bạn";
            GameManager.getInstance().setPlayerTurn(true);
            GameManager.getInstance().setPlayerMoveState(true);
        } else if (this.player.speed < this.ai.speed) {
            this.turnName.string = "Lượt của AI";
            GameManager.getInstance().setPlayerTurn(false);
            GameManager.getInstance().setPlayerMoveState(false);
            this.scheduleOnce(() => {
                cc.systemEvent.emit("START_AI_TURN");
            }, 0.5);
        } else {
            if (Math.random() < 0.5) {
                this.turnName.string = "Lượt của bạn";
                GameManager.getInstance().setPlayerTurn(true);
                GameManager.getInstance().setPlayerMoveState(true);
            } else {
                this.turnName.string = "Lượt của AI";
                GameManager.getInstance().setPlayerTurn(false);
                GameManager.getInstance().setPlayerMoveState(false);
                this.scheduleOnce(() => {
                    cc.systemEvent.emit("START_AI_TURN");
                }, 0.5);
            }
        }
    }

    setupSpecialCells() {
        BoardManager.getInstance().setSelectedSpecialCells(this.selectedSpecialCell);
        BoardManager.getInstance().replaceNormalCellsWithSpecialCells();
    }

    async updateCells(isPlayerTurnEnd: boolean) {
        let boardManager = BoardManager.getInstance();
        if (!boardManager) {
            console.error("BoardManager chưa được khởi tạo!");
            return;
        }

        let board = boardManager.cells.map(cell => cell.getComponent('Cell'));
        let cell0 = board[0];
        let cell6 = board[6];

        console.log(`Kết thúc lượt của ${isPlayerTurnEnd ? " player " : " AI "}: Ô 0 = ${cell0.getNumberOfSoldiers()}, Ô 6 = ${cell6.getNumberOfSoldiers()}`);

        if (this.checkSoldiers(board, 1, 5, "Bạn hết quân!")) return;
        if (this.checkSoldiers(board, 7, 11, "Địch hết quân!")) return;

        if (isPlayerTurnEnd) {
            if (this.ai.hp > 0) {
                this.player.specialMove(this.ai, cell0.getNumberOfSoldiers(), cell6.getNumberOfSoldiers());
                this.player.endTurn();
                if (this.ai.hp > 0) {
                    this.turnName.string = "Lượt của AI";
                    GameManager.getInstance().setPlayerTurn(false);
                    GameManager.getInstance().setPlayerMoveState(false);
                    this.scheduleOnce(() => {
                        cc.systemEvent.emit("START_AI_TURN");
                    }, 0.5);
                } else {
                    this.turnName.string = "AI đã chết!";
                    console.warn("AI đã bị đánh bại!");
                    cc.systemEvent.emit("MINT_NFT_DIEN");
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    cc.systemEvent.emit("MINT_NFT_QUAN");

                    setTimeout(() => {
                        this.turnName.string = "+ 1 Quan, 1 Dien";
                    }, 1000);

                    setTimeout(() => {
                        cc.director.loadScene("Home Menu");
                    }, 3333);
                }
            }
        } else {
            if (this.player.hp > 0) {
                this.ai.aiTurn(this.player, cell6.getNumberOfSoldiers(), cell0.getNumberOfSoldiers());
                this.ai.endTurn();
                if (this.player.hp > 0) {
                    this.turnName.string = "Lượt của bạn";
                    GameManager.getInstance().setPlayerTurn(true);
                    GameManager.getInstance().setPlayerMoveState(true);
                } else {
                    this.turnName.string = "Bạn đã chết!";
                    console.log("Player đã bị đánh bại!");

                    setTimeout(() => {
                        cc.director.loadScene("Home Menu");
                    }, 3333);
                }
            }
        }

        cell0.setNumberOfSoldiers(0);
        cell6.setNumberOfSoldiers(0);
    }

    checkSoldiers(board, start, end, message) {
        let countCheckSoldiers = 0;
        for (let i = start; i <= end; i++) {
            let cell = board[i];
            if (cell?.getNumberOfSoldiers() <= 0) countCheckSoldiers++;
        }

        if (countCheckSoldiers === 5) {
            this.turnName.string = message;
            console.log(message);
            return true;
        }
        return false;
    }
}