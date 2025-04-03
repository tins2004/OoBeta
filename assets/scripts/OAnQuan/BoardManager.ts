const { ccclass, property } = cc._decorator;
import SpecialCellData, { SpecialCellEffectType } from "./SpecialCellData";

@ccclass
export default class BoardManager extends cc.Component {
    private static instance: BoardManager = null;

    @property(cc.Prefab)
    cellPrefab: cc.Prefab = null; // Prefab cho mỗi ô cờ

    @property(cc.Node)
    board: cc.Node = null; // Node chứa các ô cờ

    cells: cc.Node[] = [];
    specialCells: SpecialCellData[] = [];
    

    onLoad() {
        if (BoardManager.instance == null) {
            BoardManager.instance = this;
        } else {
            this.destroy();
            return;
        }
        this.createBoard();
    }

    onDestroy() {
        BoardManager.instance = null;
    }

    static getInstance(): BoardManager {
        return BoardManager.instance;
    }

    createBoard() {
        let spacingX = 80, spacingY = 80; 
        let row1 = 5, row2 = 5; // Số ô quân nhỏ trên mỗi hàng

        let boardWidth = (row1 + 1) * spacingX; // Chiều rộng bàn cờ (5 ô nhỏ + 2 ô quan)
        let startX = -boardWidth / 2; // Căn giữa theo chiều ngang
        let startY = 85;
        
        this.cells = []; 

        // Thêm ô Quan lớn bên trái
        // X = Vị trí đã set(startX)
        // Y = Giữa 2 hàng(startY - spacingY/2)
        this.createCell(0, startX, startY - spacingY/2, true);
    
        // Tạo 5 ô hàng dưới
        // X = Cách vị trí bắt đầu(startX + spacingX) + khoảng cách giữa các ô(i*spacingX)
        // Y = Khoảng cách giữa các ô(startY - spacingY)
        for (let i = 0; i < row2; i++) {
            this.createCell(i + 1, startX + spacingX + i*spacingX, startY - spacingY);
        }

        // Thêm ô Quan lớn bên phải
        // X = Cách vị trí bắt đầu(startX + spacingX) + khoảng cách hết hàng 1(row1*spacingX)
        // Y = Giữa 2 hàng(startY - spacingY/2)
        this.createCell(6, startX + spacingX + row1*spacingX, startY - spacingY/2, true);

        // Tạo 5 ô hàng trên (có số thứ tự ngược lại)
        // X = Cách vị trí bắt đầu(startX + spacingX) + khoảng cách giữa các ô ngược lại((4 - i)*spacingX)
        // Y = Vị trí đã set(startY)
        for (let i = 0; i < row1; i++) {
            this.createCell(i + 7, startX + spacingX + (4 - i)*spacingX, startY);
        }
    
    }
    
    createCell(index: number, x: number, y: number, isQuan: boolean = false) {
        let cellNode = cc.instantiate(this.cellPrefab);
        cellNode.parent = this.board;
        cellNode.position = cc.v3(x, y);
    
        let cellScript = cellNode.getComponent('Cell');
        cellScript.setIndex(index, this.cells);
        cellScript.setSprite(0)
        
        // Nếu là ô quan lớn, đặt số quân khác
        if (isQuan) {
            cellNode.active = false;
            cellScript.setNumberOfSoldiers(0); // Ô quan lớn có 10 quân
        } else {
            cellScript.setNumberOfSoldiers(5); // Ô thường có 5 quân
        }
    
        this.cells.push(cellNode);
    }

    setSelectedSpecialCells(selectedCells: SpecialCellData[]) {
        this.specialCells = selectedCells;
    }

    replaceNormalCellsWithSpecialCells() {
        let normalCellIndices = [1, 2, 3, 4, 5]; // Bỏ ô 0
        let specialCellCount = this.specialCells.length;

        // Trộn vị trí các ô đất
        for (let i = normalCellIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [normalCellIndices[i], normalCellIndices[j]] = [normalCellIndices[j], normalCellIndices[i]];
        }

        // Thay thế các ô đất bằng ô đất đặc biệt
        for (let i = 0; i < specialCellCount; i++) {
            let cell = BoardManager.getInstance().cells[normalCellIndices[i]].getComponent('Cell');
            cell.specialCellData = this.specialCells[i];
            // cell.setSprite(1)
            switch (cell.specialCellData.effectType) {
                case SpecialCellEffectType.DAMAGE_BOOST:
                    cell.setSprite(1)
                    break;
                case SpecialCellEffectType.HEAL_BOOST:
                    cell.setSprite(2)
                    break;
                case SpecialCellEffectType.POISON_BOOST:
                    cell.setSprite(3)
                    break;
                case SpecialCellEffectType.BURN_BOOST:
                    cell.setSprite(4)
                    break;
                case SpecialCellEffectType.WEAKNESS_BOOST:
                    cell.setSprite(5)
                    break;
                case SpecialCellEffectType.ATTACK_BOOST:
                    cell.setSprite(6)
                    break;   
            }
            // console.log(`Áp dụng hiệu ứng đặc biệt: ${this.specialCells[i].getEffectTypeName()} lên ô ${normalCellIndices[i]}`);
        }
    }

}
