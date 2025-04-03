const {ccclass, property} = cc._decorator;
import { DataManager } from "../../DataManager";
import { EffectType } from "../Fight System/Effect";

export enum EnemyName {
    FIRE = "Tiểu quỷ",
    WEAKNESS = "Thần đèn",
    POISON = "Bùn tinh",
    STUN = "Xà nữ"
}

@ccclass
export default class MissionManager extends cc.Component {

    @property(cc.Prefab)
    missionPrefab: cc.Prefab = null;

    @property(cc.Node)
    missionPage: cc.Node = null;

    enemyList: any[];

    @property(cc.Node)
    selectionQuanMenu: cc.Node = null;

    @property(cc.Node)
    homeMenu: cc.Node = null;

    onLoad(): void {
      this.selectionQuanMenu.active = false;
      this.homeMenu.active = true;

      this.enemyList = [];
      this.enemyList.push(this.randomMission(-0.8, -0.5, 1));
      this.enemyList.push(this.randomMission(-0.5, 0.2, 2));
      this.enemyList.push(this.randomMission(0.2, 0.5, 3));

      this.loadAndDisplayQuan();
    }

    loadAndDisplayQuan() {
      if (this.enemyList) {

        this.enemyList.forEach((enemyData, index) => {
              // Tạo item cho scrollView
              let missionItem = cc.instantiate(this.missionPrefab);
              this.setupQuanItem(missionItem, enemyData);
              this.missionPage.addChild(missionItem);
          });
      }
  }

  setupQuanItem(missionItem: cc.Node, enemyData: any) {
      // Lấy các node con từ item prefab
      let nameLabel = missionItem.getChildByName("NameLabel").getComponent(cc.Label);
      let infoLabel = missionItem.getChildByName("InfoLabel").getComponent(cc.Label);
      let skillLabel = missionItem.getChildByName("SkillLabel").getComponent(cc.Label);
      let selectButton = missionItem.getChildByName("SelectButton");
      let selectButtonLabel = selectButton.getChildByName("Background").getChildByName("Label").getComponent(cc.Label);

      // Thiết lập các chỉ số
      nameLabel.string = enemyData.name;
      infoLabel.string = `${enemyData.health}\n${enemyData.damage}\n${enemyData.armor}\n${enemyData.speed}\n${enemyData.critRate > 0 ? enemyData.critRate : "---"}`
      
      let skills: EffectType[] = enemyData.skills.map((skill: number) => skill as EffectType);
      skillLabel.string = skills.map(effect => this.getSkillStringFromEffectTypeString(EffectType[effect])).join("\n");
      
      switch (skills.length){
        case 1:
          selectButtonLabel.string = "Mức độ: Dễ\n\n1% Nhận quan mới\n10% Nhận điền mới"
          break;
        case 2:
          selectButtonLabel.string = "Mức độ: Trung Bình\n\n5% Nhận quan mới\n20% Nhận điền mới"
          break;
        case 3:
          selectButtonLabel.string = "Mức độ: Khó\n\n10% Nhận quan mới\n30% Nhận điền mới"
          break;
      }

      // Thiết lập sự kiện cho nút chọn
      selectButton.on("click", () => {
          // this.selectQuanMerge(quanData, selectButtonLabel);
          // console.log(enemyData);
          
          DataManager.instance.selectionEnemy = enemyData;
          this.selectionQuanMenu.active = true;
          this.homeMenu.active = false;
      });
      
  }

    private randomMission(percentageMin: number, percentageMax: number, numberSkill: number){
      const enemy = [EnemyName.FIRE, EnemyName.POISON, EnemyName.WEAKNESS, EnemyName.STUN];
        const enemyType = enemy[Math.floor(Math.random() * enemy.length)];
        const highest = this.getHighestQuanStats();

        let enemyData = {
            name: enemyType,
            health: this.randomPercentageInRange(highest.health, percentageMin, percentageMax),
            damage: this.randomPercentageInRange(highest.damage, percentageMin, percentageMax),
            armor: this.randomPercentageInRange(highest.armor, percentageMin, percentageMax),
            speed: this.randomPercentageInRange(highest.speed, percentageMin, percentageMax),
            critRate: this.randomPercentageInRange(highest.critRate, percentageMin, percentageMax),
            skills: this.getSkillsByEmeny(enemyType, numberSkill)
        };

        // console.log(enemyData);
        return enemyData;
    }

    private randomPercentageInRange(baseValue: number, percentageMin: number, percentageMax: number): number {
      const randomPercentage = percentageMin + Math.random() * (percentageMax - percentageMin);
      return Math.round(baseValue * (1 + randomPercentage)); // Round to integer if needed
    }

    // private randomInRange(min: number, max: number): number {
    //     return Math.random() * (max - min) + min;
    // }

    getSkillsByEmeny(enemyType: EnemyName, numberSkill: number): EffectType[] {
        let allSkills: EffectType[] = [];
      
        switch (enemyType) {
          case EnemyName.FIRE:
            allSkills = [EffectType.BURN, EffectType.SLOW, EffectType.DEBUFF_ARMOR];
            break;
          case EnemyName.WEAKNESS:
            allSkills = [EffectType.WEAKNESS, EffectType.BLOCK, EffectType.DEBUFF_ARMOR];
            break;
          case EnemyName.POISON:
            allSkills = [EffectType.POISON, EffectType.CONFUSION, EffectType.WEAKNESS];
            break;
          case EnemyName.STUN:
            allSkills = [EffectType.STUN, EffectType.SLOW, EffectType.WEAKNESS];
            break;
        }
      
        if (allSkills.length <= numberSkill) {
          return allSkills;
        }
      
        const selectedSkills: EffectType[] = [];
      
        for (let i = 0; i < numberSkill; i++) {
          selectedSkills.push(allSkills[i]);
        }
      
        return selectedSkills;
    }


    getHighestQuanStats() {
        // Đọc dữ liệu JSON hiện có từ localStorage
        // let quanListString = cc.sys.localStorage.getItem("QuanData");
        // let quanList = quanListString ? JSON.parse(quanListString) : [];
        let quanList = DataManager.instance.dataQuan;
      
        if (quanList.length === 0) {
          console.log("Chưa có dữ liệu Quan nào trong localStorage.");
          return null; // Hoặc trả về một đối tượng rỗng tùy ý
        }
      
        let highestStats = {
          health: -Infinity,
          damage: -Infinity,
          armor: -Infinity,
          speed: -Infinity,
          critRate: -Infinity,
        };
      
        let highestQuan = null;
      
        for (const quan of quanList) {
          if (quan.health > highestStats.health) {
            highestStats.health = quan.health;
            highestQuan = quan;
          }
          if (quan.damage > highestStats.damage) {
            highestStats.damage = quan.damage;
            highestQuan = quan;
          }
          if (quan.armor > highestStats.armor) {
            highestStats.armor = quan.armor;
            highestQuan = quan;
          }
          if (quan.speed > highestStats.speed) {
            highestStats.speed = quan.speed;
            highestQuan = quan;
          }
          if (quan.critRate > highestStats.critRate) {
            highestStats.critRate = quan.critRate;
            highestQuan = quan;
          }
        }
      
        if (highestQuan) {
        //   console.log("Chỉ số Quan cao nhất:");
        //   console.log(`Máu: ${highestStats.health}`);
        //   console.log(`Sát thương: ${highestStats.damage}`);
        //   console.log(`Giáp: ${highestStats.armor}`);
        //   console.log(`Tốc độ: ${highestStats.speed}`);
        //   console.log(`Chí mạng: ${highestStats.critRate}`);
          return {
            health: highestStats.health,
            damage: highestStats.damage,
            armor: highestStats.armor,
            speed: highestStats.speed,
            critRate: highestStats.critRate,
          };
        } else {
          console.log("Không tìm thấy dữ liệu Quan để so sánh.");
          return null;
        }
      }

      getSkillStringFromEffectTypeString(effectType: string): string {
        switch (effectType) {
            case "STUN": // 0
                return "Gây choáng kẻ thù"
            case "BURN": // 1
                return "Gây cháy kẻ thù"
            case "DEBUFF_ARMOR": // 2
                return "Giảm giáp kẻ thù"
            case "WEAKNESS": // 3
                return "Giảm sức mạnh kẻ thù"
            case "SLOW": // 4
                return "Làm chậm kẻ thù"
            case "CONFUSION": // 5
                return "Giảm chí mạng kẻ thù"
            case "POISON": // 6
                return "Gây độc lên kẻ thù"
            case "STRENGTH": // 7
                return "Tăng sức mạnh"
            case "TOUGHNESS": // 8
                return "Tăng phòng thủ"
            case "AGILITY": // 9
                return "Tăng tốc độ"
            case "FOCUS": // 10
                return "Tăng chí mạng"
            case "BLOCK": // 11
                return "Chặn sát thương"
        }
    }
}
