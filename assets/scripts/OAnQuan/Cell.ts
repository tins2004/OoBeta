const { ccclass, property } = cc._decorator;
import GameManager from "./GameManager";
import SpecialCellData from "./SpecialCellData";

import Character from "./Fight System/Character";
import FightManager from "./Fight System/FightManager";

@ccclass
export default class Cell extends cc.Component {
    static currentActiveMenu: cc.Node = null;
    
    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    cellSprites: cc.SpriteFrame[] = [];

    @property(cc.Node)
    moveMenu: cc.Node = null;

    @property([cc.Button])
    moveButtons: cc.Button[] = [];

    @property(cc.Node)
    informationBox: cc.Node = null;

    speedSpreading: number = 0.35;

    index: number = 0;
    numberOfSoldiers: number = 0;
    board: Cell[] = [];

    specialCellData: SpecialCellData = null; // Dữ liệu ô đất đặc biệt

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

        if (this.moveButtons.length >= 2) {
            this.moveButtons[0].node.on("click", () => this.move(-1, this.endTurn), this);
            this.moveButtons[1].node.on("click", () => this.move(1, this.endTurn), this);
        }

        this.hideMoveMenu();
    }

    setIndex(idx: number, board: Cell[]) {
        this.index = idx;
        this.board = board;
    }

    setSprite(index: number) {
        if (index >= 0 && index < this.cellSprites.length) {
            this.sprite.spriteFrame = this.cellSprites[index];
        } else {
            console.error("Index vượt quá giới hạn của mảng cellSprites.");
        }
    }

    setNumberOfSoldiers(value: number) {
        this.numberOfSoldiers = value;
        this.label.string = value.toString();

        this.setNumberOfSoldiersInWarlordCell(this.index, value);
    }

    getNumberOfSoldiers(): number {
        return this.numberOfSoldiers;
    }

    onClick() {
        if (!GameManager.getInstance().isPlayerTurn || !GameManager.getInstance().playerCanMove) {
            console.log("Không phải lượt của người chơi!");
            return;
        }

        if (this.specialCellData) {
            console.log(`Ô có hiệu ứng: ${this.specialCellData.getEffectTypeName()}`);
            // this.informationBox.active = true;
            this.informationBox.getComponentInChildren(cc.Label).string = this.specialCellData.getEffectInformation();
            
        } else this.informationBox.active = false;

        if (this.index >= 1 && this.index <= 5 && this.numberOfSoldiers > 0) {
            this.showMoveMenu();
        }
    }

    showMoveMenu() {
        // Nếu có menu đang mở, ẩn nó đi trước khi mở menu mới
        if (Cell.currentActiveMenu && Cell.currentActiveMenu !== this.moveMenu) {
            Cell.currentActiveMenu.active = false;
        }
    
        if (this.moveMenu) {
            this.moveMenu.active = true;
            Cell.currentActiveMenu = this.moveMenu; // Cập nhật menu hiện tại
        }
    }

    hideMoveMenu() {
        if (this.moveMenu) {
            this.moveMenu.active = false;
        }
    }

    move(direction: number, callback: () => void) {
        let stones = this.numberOfSoldiers;
        if (stones === 0) return;
        GameManager.getInstance().setPlayerMoveState(false);
        
        this.setNumberOfSoldiers(0);
        this.hideMoveMenu();
        let character = this.getTurnCharacter()[0];

        // console.log(`Bắt đầu rải quân từ ô ${this.index} với ${stones} quân`);

        let pos = this.index;
        let posEnemyNumber = null;
        let effectNode: cc.Node = null; // Node hiệu ứng duy nhất

        if (character.moveEffect) {
            effectNode = cc.instantiate(character.moveEffect);

            if (effectNode) {
                let animationComponent = effectNode.getComponent(cc.Animation);
                if (animationComponent && animationComponent.getClips().length > 0) {
                    let defaultClip = 0;
                    switch (character.characterName){
                        case "Thần đèn":
                            defaultClip = 1;
                            break;
                        case "Bùn tinh":
                            defaultClip += 2;
                            break;
                        case "Xà nữ":
                            defaultClip += 3;
                            break;
                    }
                    animationComponent.play(animationComponent.getClips()[defaultClip].name);
                } else {
                    console.warn("Không tìm thấy component Animation hoặc không có clip nào trong moveEffect.");
                }
            } else {
                console.warn("moveEffect không được gán.");
            }

            effectNode.parent = this.node.parent;
            effectNode.position = this.board[pos].getComponent('Cell').node.position; // Đặt vị trí ban đầu
            effectNode.active = true;
        } else {
            console.error("Không tìm thấy prefab của hiệu ứng di chuyển.");
            return; // Dừng nếu không có prefab
        }

        // Flip hướng
        if (GameManager.getInstance().isPlayerTurn)
            effectNode.scaleX = direction;
        else
            effectNode.scaleX = -direction;

        const distribute = () => {
            if (stones > 0) {
                pos = (pos + direction + this.board.length) % this.board.length;
                let cellScript = this.board[pos].getComponent('Cell');
                
                cellScript.setNumberOfSoldiers(cellScript.getNumberOfSoldiers() + 1);
                stones--;
            
                if (pos === 0 || pos === 6) {
                    effectNode.scaleX *= -1; // Flip
                }

                if (pos === 6){
                    posEnemyNumber++;
                }

                 // Di chuyển animation ngay khi rải quân
                cc.tween(effectNode)
                .to(this.speedSpreading - 0.02, { position: cellScript.node.position })
                .start();

                cc.tween(this.node)
                    .delay(this.speedSpreading)
                    .call(distribute)
                    .start();
            } else {
                let nextPos = (pos + direction + this.board.length) % this.board.length;
                let nextCell = this.board[nextPos].getComponent('Cell');

                // Tiếp tục rải quân nếu ô đó có quân và không phải là ô quan
                if (nextCell.getNumberOfSoldiers() > 0 && nextPos !== 0 && nextPos !== 6) {
                    stones = nextCell.getNumberOfSoldiers();
                    pos = nextPos;
                    nextCell.setNumberOfSoldiers(0);

                    // console.log(`Tiếp tục rải quân từ ô ${nextPos} với ${stones} quân`);
                    distribute();
                } else {
                    if (this.specialCellData && posEnemyNumber > 0) {
                        this.applySpecialCellEffect(); // Áp dụng hiệu ứng ô đất đặc biệt
                    }
                    console.log("Hoàn thành rải quân!");
                    effectNode.destroy();
                    callback();
                }
            }
        };

        distribute();
    }

    endTurn() {
        cc.systemEvent.emit("PLAYER_TURN_ENDED");
    }

    getTurnCharacter(): Character[] {
        let character: Character = null;
        let characterEnemy: Character = null;
        let fightManager = cc.find("Canvas/Game Manager").getComponent(FightManager);

        if (fightManager) {
            if (GameManager.getInstance().isPlayerTurn) {
                character = fightManager.player;
                characterEnemy = fightManager.ai;
            } else {
                character = fightManager.ai;
                characterEnemy = fightManager.player;
            }
        } else {
            console.error("Không tìm thấy FightManager.");
            return null;
        }

        return [character, characterEnemy];
    }


    applySpecialCellEffect() {
        let character: Character[] = this.getTurnCharacter();

        if (character) {
            character[0].useSpecialCell(this.specialCellData, character[1]);
            // console.log(`Áp dụng hiệu ứng đặc biệt: ${this.specialCellData.getEffectTypeName()} cho ${character.characterName}`);
        } else {
            console.error("Không tìm thấy Character phù hợp để áp dụng hiệu ứng.");
        }
    }

    setNumberOfSoldiersInWarlordCell(posCell: number, index: number) {
        if (posCell !== 0 && posCell !== 6) 
            return;

        let character: Character = null;
        let fightManager = cc.find("Canvas/Game Manager").getComponent(FightManager);

        if (fightManager) {
            if (posCell === 0) {
                character = fightManager.player;
            } else {
                character = fightManager.ai;
            }
        } else {
            console.error("Không tìm thấy FightManager.");
        }

        if (character)
            character.updateSolidersLabel(index);
    }

}
