<template>
  <div>
    <div class="flex justify-between text-white mt-2">
      <h3>{{ userName }}</h3>
      <p>Score : {{ score }}</p>
    </div>
    <div class="playground player-ground relative">
      <div
        v-if="combo > 0"
        class="combo text-red-500 text-[36px] font-bold flex items-center justify-center absolute w-[100px] h-[100px] -top-[50px] -right-[50px]"
      >
        <!-- <img
        src="@/assets/images/explosion.png"
        alt="exp"
        class="combo "
      /> -->
        {{ combo }}
      </div>

      <ul class="border border-stone-600" :class="{ rotate: rotate === true }">
        <li v-for="(row, rowIndex) in grids" :key="rowIndex">
          <ul>
            <li
              v-for="(col, colIndex) in row"
              :key="`${colIndex}-${statusKey}`"
              class="text-white"
              :class="{ moving: col.status === 'moving', [col.type]: true }"
            ></li>
          </ul>
        </li>
      </ul>
      <div v-if="blind" class="absolute bg-black/90 w-full h-full top-0"></div>
      <div
        v-if="winGame"
        class="winGame absolute bg-rose-500/90 w-full h-full top-0 text-[50px] text-white flex items-center justify-center"
      >
        Congraturations!!! <br />
        You Win!!!
      </div>
    </div>
    <div>
      <ul class="item-list" :key="itemKey">
        <li :class="item" v-for="(item, index) in gameItems" :key="index">
          <span>{{ index + 1 }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { BASIC_GRIDS, DEAD_ROW } from "@/constants/grids";
import { BASIC_BLOCKS } from "@/constants/blocks";
export default {
  name: "PlayGround",
  props: {
    type: {
      type: String,
      default: "player",
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    defaultGrids: {
      type: Array,
      default() {
        return structuredClone(BASIC_GRIDS);
      },
    },
    defaultBlocks: {
      type: Object,
      default() {
        return BASIC_BLOCKS;
      },
    },
    defaultDeadRow: {
      type: Array,
      default() {
        return DEAD_ROW;
      },
    },
    userName: {
      type: String,
      default: "Player",
    },
    opponentScore: {
      type: Number,
      default: 0,
    },
    opponentItems: {
      type: Array,
      default() {
        return [
          { active: false },
          { active: false },
          { active: false },
          { active: false },
          { active: false },
        ];
      },
    },
  },
  data() {
    return {
      GAME_ITEMS: ["blocks", "ignore", "prohibition", "refresh", "speedometer"],
      generated: false,
      pressed: false,
      score: 0,
      gameInterval: null,
      tempMovingItem: {},
      movingItem: {},
      duration: 1000,

      movingCoords: [],
      statusKey: 0,
      grids: [],
      blocks: [],
      deadRow: [],
      hold: false,
      holdType: "",
      seized: false,
      combo: 0,
      isCombo: false,
      itemKey: 0,
      gameItems: ["", "speedometer", "refresh", "", ""],
      disableKey: false,
      blind: false,
      rotate: false,
      winGame: false,
    };
  },
  watch: {
    isPlaying: {
      handler() {
        // console.log(val)
        // if (val) {
        //   this.gameInterval = setInterval(() => {
        //     this.moveBlock('top', 1)
        //   }, this.duration)
        // } else {
        //   clearInterval(this.gameInterval)
        // }
      },
      immediate: true,
    },
    score: {
      handler() {
        if (this.isCombo === false) {
          this.isCombo = true;
          setTimeout(() => {
            this.isCombo = false;
            this.combo = 0;
          }, 1000);
        }

        // if (val % 50 === 0 && this.duration > 110) {
        //   this.duration = this.duration - 100;
        //   this.restartInterval();
        // }
      },
    },
  },
  unmounted() {
    document.removeEventListener("keydown", this.handleKeyPress);
  },
  mounted() {
    if (this.type === "player") {
      document.addEventListener("keydown", this.handleKeyPress);
    }
    this.grids = this.defaultGrids;
    this.blocks = this.defaultBlocks;
    this.deadRow = this.defaultDeadRow;
    // this.init()
  },
  methods: {
    takeItem(item) {
      console.log(item);
      switch (item) {
        case "blocks":
          this.addBlocks();
          break;
        case "prohibition":
          this.ignoreKeys();
          break;
        case "ignore":
          this.blindScreen();
          break;

        case "refresh":
          this.rotateScreen();
          break;

        case "speedometer":
          this.speedUp();
          break;
        default:
          break;
      }
    },
    useItem(num) {
      if (!this.gameItems[num]) return;
      this.$emit("handleOpponentEvent", {
        action: "useItem",
        param: { item: this.gameItems[num] },
      });
      this.gameItems[num] = "";
    },
    speedUp() {
      this.clearGameInterval();
      this.duration = 70;
      this.setGameInterval();
      setTimeout(() => {
        this.clearGameInterval();
        this.duration = 1000;
        this.setGameInterval();
      }, 10000);
    },
    rotateScreen() {
      this.rotate = true;
      setTimeout(() => {
        this.rotate = false;
      }, 8000);
    },
    blindScreen() {
      this.blind = true;
      setTimeout(() => {
        this.blind = false;
      }, 5000);
    },
    ignoreKeys() {
      this.disableKey = true;
      setTimeout(() => {
        this.disableKey = false;
      }, 5000);
    },
    addBlocks() {
      let i = 0;
      for (i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * this.deadRow.length);
        const row = structuredClone(this.deadRow);
        row[randomIndex].status = "";
        row[randomIndex].type = "";
        this.grids.push(row);
        this.grids.shift();
      }
    },
    clearGameInterval() {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    },
    setGameInterval() {
      if (!this.gameInterval) {
        this.gameInterval = setInterval(() => {
          this.moveBlock("top", 1, true);
        }, this.duration);
      }
    },
    renderSync(param) {
      this.grids = param.grids;
      this.score = param.score;
      this.gameItems = param.items;
      this.itemKey++;
    },
    handleKeyPress(e) {
      e.preventDefault();
      if (this.disableKey) return;
      // console.log('handle key press')
      switch (e.keyCode) {
        case 49:
          this.useItem(0);
          break;
        case 50:
          this.useItem(1);
          break;
        case 51:
          this.useItem(2);
          break;
        case 52:
          this.useItem(3);
          break;
        case 53:
          this.useItem(4);
          break;
        case 32: // space
          this.dropBlock();

          break;
        case 40: // top
          this.moveBlock("top", 1);

          break;
        case 39: // right
          this.moveBlock("left", 1);

          break;
        case 37: // left
          this.moveBlock("left", -1);

          break;
        case 38: // up
          this.changeDirection();
          break;
        default:
          break;
      }
    },
    test() {
      this.generateNewBlock();
    },
    init() {
      setInterval(() => {
        this.$emit("handleOpponentEvent", {
          action: "renderSync",
          param: {
            grids: this.grids,
            score: this.score,
            items: this.gameItems,
          },
        });
      }, 500);
      this.generateNewBlock();
    },
    gameWin() {
      this.winGame = true;
    },
    gameOver() {
      this.clearGameInterval();
      this.$emit("gameOver");
      this.$emit("handleOpponentEvent", {
        action: "gameOver",
        param: {},
      });
    },
    prependNewLine() {},
    restartInterval() {
      this.clearGameInterval();
      this.setGameInterval();
    },
    generateNewBlock() {
      if (this.generated) return;
      this.generated = true;
      this.seized = false;
      this.clearGameInterval();
      const blockArray = Object.entries(this.blocks);
      const randomIndex = Math.floor(Math.random() * blockArray.length);
      this.movingItem.type = blockArray[randomIndex][0];

      this.$emit("handleOpponentEvent", {
        action: "generateNewBlock",
        param: this.movingItem.type,
      });

      this.movingItem.top = 0;
      this.movingItem.left = 5;
      this.movingItem.direction = 0;
      this.tempMovingItem = { ...this.movingItem };
      this.renderBlocks();
      this.setGameInterval();
      setTimeout(() => {
        this.generated = false;
      }, 50);
    },
    moveBlock(moveType, amount) {
      this.tempMovingItem[moveType] += amount;
      this.renderBlocks(moveType, amount);
    },
    renderBlocks(moveType) {
      const { type, direction, top, left } = this.tempMovingItem;

      // 이전 클래스 제거
      this.movingCoords.forEach((coord) => {
        this.grids[coord[0]][coord[1]].status = "";
        this.grids[coord[0]][coord[1]].type = "";
      });

      this.movingCoords = [];
      if (!type || direction < 0) return;

      // let standardBlock = this.blocks[type][direction].reduce(
      //   (acc, cur) => {
      //     const x = cur[0] + left
      //     const y = cur[1] + top
      //    // console.log(moveType, amount, cur)
      //     if (moveType === 'top') {
      //       return acc[1] < y ? cur : acc
      //     } else if (moveType === 'left' && amount === -1) {
      //       return acc[0] > x ? cur : acc
      //     } else if (moveType === 'left' && amount === 1) {
      //       return acc[0] < x ? cur : acc
      //     }
      //     return acc
      //   },
      //   [[0, 0]]
      // )
      const findBanIndex = this.blocks[type][direction].find(
        (b) => b.ban === moveType
      );

      if (findBanIndex > -1) return;
      let completed = true;
      this.blocks[type][direction].some((block) => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = this.grids[y] ? this.grids[y][x] : null;
        if (!target) {
          this.hold = true;
          this.holdType = moveType;
          this.tempMovingItem = { ...this.movingItem };
          block.ban = moveType;
          setTimeout(() => {
            this.renderBlocks(moveType === "top" ? "seized" : null);
          }, 0);

          completed = false;
          return true;
        }
        const isEmpty = target.status !== "seized";

        if (isEmpty) {
          target.status = "moving";
          target.type = type;
          this.movingCoords = [...this.movingCoords, [y, x]];
        } else {
          // console.log("y", y);
          if (y <= 0) {
            this.gameOver();
            return true;
          }

          this.tempMovingItem = { ...this.movingItem };
          setTimeout(() => {
            this.renderBlocks(moveType === "top" ? "seized" : null);
          }, 0);
          return true;
          // if (moveType === 'retry') {
          //   clearInterval(this.gameInterval)
          //   // this.showGameOverText()
          //   return true
          // } else {

          //   setTimeout(() => {
          //     this.renderBlocks('retry')
          //   }, 0)
          // }
        }
      });
      if (moveType === "seized") {
        this.seizeBlock();
      }
      if (completed) {
        this.movingItem.left = left;
        this.movingItem.top = top;
        this.movingItem.direction = direction;
      }

      this.statusKey++;
    },
    dropBlock() {
      // this.clearGameInterval();
      const { type, direction, left } = this.tempMovingItem;
      let matched = false;
      let nextTop = 0;

      this.grids.some((grid, gridIndex) => {
        this.blocks[type][direction].some((block) => {
          let x = block[0] + left;
          let y = block[1] + gridIndex;
          if (!this.grids[y]) {
            nextTop = gridIndex - 1;
            matched = true;
            return true;
          }
          if (this.grids[y] && this.grids[y][x].status === "seized") {
            nextTop = gridIndex - 1;
            matched = true;
            return true;
          }
        });
        if (!matched) nextTop = gridIndex;

        return matched;
      });
      if (type === "bar") {
        console.log(nextTop);
      }
      this.movingItem.top = nextTop - 2;
      this.tempMovingItem.top = nextTop;
      this.renderBlocks();
      this.seizeBlock();
      // if (!matched) {
      //   this.movingItem.top = this.grids.length - 2;
      //   this.tempMovingItem.top = this.grids.length - 1;
      // } else {
      //   this.movingItem.top = nextTop;
      //   this.tempMovingItem.top = nextTop + 1;
      // }
      // this.renderBlocks("top");

      // this.blocks[type][direction].some((block) => {
      //   let x = block[0] + left;
      //   let y = block[1] + top;

      //   let matched = false;
      //   while (matched === false) {
      //     if (!this.grids[y]) matched = true;
      //     if (this.grids[y] && this.grids[y][x].status === "seized") {
      //       matched = true;
      //     }
      //     y++;
      //   }
      //   if (matched) {
      //     max = max < y - 3 ? y - 3 : max;
      //     return true;
      //   }
      // });

      // console.log(max, "y");

      // this.clearGameInterval()
      // if(!this.gameInterval){

      //   this.gameInterval = setInterval(() => {
      //     this.moveBlock('top', 1, true)
      //   }, 20)
      // }
    },
    seizeBlock() {
      this.seized = true;
      this.movingCoords.forEach((coord) => {
        this.grids[coord[0]][coord[1]].status = "seized";
      });
      this.movingCoords = [];

      this.checkMatch();
    },
    checkMatch() {
      const matchedRowIndexs = [];
      const matchedRows = [];
      this.grids.forEach((grid, index) => {
        let matched = true;
        grid.forEach((col) => {
          if (col.status !== "seized") matched = false;
        });
        if (matched) {
          matchedRowIndexs.push(index);

          const item = grid.map(() => {
            return { status: "", type: "" };
          });
          matchedRows.push(item);
        }
      });

      this.score = this.score + matchedRowIndexs.length * 10;
      this.combo = matchedRowIndexs.length;
      if (this.score % 50 === 0 && this.score > 0) {
        const randomIndex = Math.floor(Math.random() * 6);

        const targetIndex = this.gameItems.findIndex((item) => item === "");
        if (targetIndex > -1) {
          this.gameItems[targetIndex] = this.GAME_ITEMS[randomIndex];

          this.itemKey++;
        }
      }
      if (this.combo > 1) {
        let i = 0;
        for (i = 1; i < this.combo; i++) {
          const randomIndex = Math.floor(Math.random() * 6);

          const targetIndex = this.gameItems.findIndex((item) => item === "");
          if (targetIndex > -1) {
            this.gameItems[targetIndex] = this.GAME_ITEMS[randomIndex];
          }
        }

        this.itemKey++;
      }

      this.grids = this.grids.filter((grid, gridIndex) => {
        return !matchedRowIndexs.includes(gridIndex);
      });

      matchedRows.forEach((row) => {
        this.grids.unshift(row);
      });
      // const childNodes = playground.childNodes
      // childNodes.forEach((child) => {
      //   let matched = true
      //   child.children[0].childNodes.forEach((li) => {
      //     if (!li.classList.contains('seized')) {
      //       matched = false
      //     }
      //   })
      //   if (matched) {
      //     child.remove()
      //     prependNewLine(playground)
      //   }
      // })
      setTimeout(() => {
        this.generateNewBlock();
      }, 100);
    },
    changeDirection() {
      const currDirection = this.tempMovingItem.direction;
      currDirection === 3
        ? (this.tempMovingItem.direction = 0)
        : (this.tempMovingItem.direction += 1);

      this.renderBlocks();
    },
  },
};
</script>

<style scoped>
.playground-wrapper {
  display: flex;
  overflow-y: auto;
}
.playground {
  background: #27272a;
}
.playground > ul {
  border-collapse: collapse;
}
.playground > ul > li {
  width: 100%;
  height: 25px;
}
.playground > ul > li > ul {
  display: flex;
}
.playground > ul > li > ul > li {
  width: 25px;
  height: 25px;
  outline: 0.05em solid #3f3f46;
  font-size: 12px;
}

.item-list {
  display: grid;
  color: #fff;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 10px;
  width: 100%;
  margin-top: 10px;
}
.item-list > li {
  background-color: rgba(0, 0, 0, 0.3);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.6);
  padding-left: 2px;
  background-size: 80% 80%;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 50px;
}

.item-list > li > span {
  font-size: 10px;
  position: absolute;
  left: 2px;
}

.item-list > .blocks {
  background-image: url("@/assets/images/items/blocks.png");
}

.item-list > .ignore {
  background-image: url("@/assets/images/items/ignore.png");
}

.item-list > .prohibition {
  background-image: url("@/assets/images/items/prohibition.png");
}

.item-list > .refresh {
  background-image: url("@/assets/images/items/refresh.png");
}

.item-list > .speedometer {
  background-image: url("@/assets/images/items/speedometer.png");
}

.square {
  background: #2c82c9;
}
.bar {
  background: salmon;
}
.tree {
  background: #67c23a;
}
.zee {
  background: #e6a23c;
}
.zeeOp {
  background: #4f46e5;
}
.elLeft {
  background: #8e44ad;
}
.elRight {
  background: #16a085;
}
.dead {
  background: #881337;
}

.combo {
  animation-name: textBlink;
  animation-duration: 0.2s;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
  background: url("@/assets/images/explosion.png");
  background-size: cover;
}

.rotate {
  transform: rotate(180deg);
  border: 2px dotted salmon;
}

.winGame {
  background-image: url("@/assets/images/items/surprise-box.png");
  background-size: 50%;
  background-position: center;
}
@keyframes textBlink {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}
</style>
