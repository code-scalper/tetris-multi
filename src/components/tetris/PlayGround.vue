<template>
  <div>
    <div class="flex justify-between text-white mt-2">
      <h3>{{ userName }}</h3>
      <p>Score : {{ score }}</p>
    </div>
    <div class="playground player-ground">
      <ul class="border border-stone-600">
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
    </div>
    <div>
      <ul class="item-list">
        <li class="item1">
          <span>1</span>
        </li>
        <li class="item2"><span>2</span></li>
        <li class="item3"><span>3</span></li>
        <li class="item4"><span>4</span></li>
        <li class="item5"><span>5</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { BASIC_GRIDS } from '@/constants/grids'
import { BASIC_BLOCKS } from '@/constants/blocks'
export default {
  name: 'PlayGround',
  props: {
    type: {
      type: String,
      default: 'player'
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    defaultGrids: {
      type: Array,
      default() {
        return structuredClone(BASIC_GRIDS)
      }
    },
    defaultBlocks: {
      type: Object,
      default() {
        return BASIC_BLOCKS
      }
    },
    userName: {
      type: String,
      default: 'Player'
    },
    opponentScore: {
      type: Number,
      default: 0
    },
    opponentItems: {
      type: Array,
      default() {
        return [
          { active: false },
          { active: false },
          { active: false },
          { active: false },
          { active: false }
        ]
      }
    }
  },
  data() {
    return {
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
      hold: false,
      holdType: ''
    }
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
      immediate: true
    },
    score: {
      handler(val){
        if(val%50 === 0 && this.duration > 110){
          this.duration = this.duration - 100
          this.restartInterval()
        }
      }
    }
  },
  unmounted() {
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  mounted() {
    if (this.type === 'player') {
      document.addEventListener('keydown', this.handleKeyPress)
    }
    this.grids = this.defaultGrids
    this.blocks = this.defaultBlocks
    // this.init()
  },
  methods: {
    renderSync(param) {
      this.grids = param.grids;
      this.score = param.score;
    },
    handleKeyPress(e) {
      e.preventDefault();
      
      // console.log('handle key press')
      switch (e.keyCode) {
        case 32: // space
          this.dropBlock()

          break
        case 40: // top
          this.moveBlock('top', 1)

          break
        case 39: // right
          this.moveBlock('left', 1)

          break
        case 37: // left
          this.moveBlock('left', -1)

          break
        case 38: // up
          this.changeDirection()
          break
        default:
          break
      }
    },
    test() {
      this.generateNewBlock()
    },
    init() {
      setInterval(() => {
        this.$emit('handleOpponentEvent', {
          action: 'renderSync',
          param: {grids: this.grids, score: this.score}
        })
      }, 500)
      this.generateNewBlock()
    },
    gameOver() {
      clearInterval(this.gameInterval)
      console.log('game over')
      this.$emit('gameOver')
    },
    prependNewLine() {},
    restartInterval(){
      clearInterval(this.gameInterval)
      this.gameInterval = setInterval(() => {
            this.moveBlock('top', 1, true)
      }, this.duration)
    },
    generateNewBlock() {
      clearInterval(this.gameInterval)
      const blockArray = Object.entries(this.blocks)
      const randomIndex = Math.floor(Math.random() * blockArray.length)
      this.movingItem.type = blockArray[randomIndex][0]
      this.$emit('handleOpponentEvent', {
        action: 'generateNewBlock',
        param: this.movingItem.type
      })

      this.movingItem.top = 0
      this.movingItem.left = 5
      this.movingItem.direction = 0
      this.tempMovingItem = { ...this.movingItem }
      this.renderBlocks()
      console.log(this.duration)
      this.gameInterval = setInterval(() => {
            this.moveBlock('top', 1, true)
      }, this.duration)
    },
    moveBlock(moveType, amount) {
      this.tempMovingItem[moveType] += amount
      this.renderBlocks(moveType, amount)
    },
    renderBlocks(moveType) {
      const { type, direction, top, left } = this.tempMovingItem

      // 이전 클래스 제거
      this.movingCoords.forEach((coord) => {
        this.grids[coord[0]][coord[1]].status = ''
        this.grids[coord[0]][coord[1]].type = ''
      })

      this.movingCoords = []
      if (!type || direction < 0) return

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
      const findBanIndex = this.blocks[type][direction].find((b) => b.ban === moveType)

      if (findBanIndex > -1) return
      let completed = true
      this.blocks[type][direction].some((block) => {
        const x = block[0] + left
        const y = block[1] + top
        const target = this.grids[y] ? this.grids[y][x] : null
        if (!target) {
          this.hold = true
          this.holdType = moveType
          this.tempMovingItem = { ...this.movingItem }
          block.ban = moveType
          console.log(block.ban)
          setTimeout(() => {
            this.renderBlocks(moveType === 'top' ? 'seized' : null)
          }, 0)

          completed = false
          return true
        }
        const isEmpty = target.status !== 'seized'

        if (isEmpty) {
          target.status = 'moving'
          target.type = type
          this.movingCoords = [...this.movingCoords, [y, x]]
        } else {
          if (y <= 1) {
            this.gameOver()
            return true
          }

          this.tempMovingItem = { ...this.movingItem }
          setTimeout(() => {
            this.renderBlocks(moveType === 'top' ? 'seized' : null)
          }, 0)
          return true
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
      })
      if (moveType === 'seized') {
        this.seizeBlock()
      }
      if (completed) {
        this.movingItem.left = left
        this.movingItem.top = top
        this.movingItem.direction = direction
      }

      this.statusKey++
    },
    dropBlock() {
      clearInterval(this.gameInterval)
      this.gameInterval = setInterval(() => {
        this.moveBlock('top', 1, true)
      }, 20)
    },
    seizeBlock() {
      this.movingCoords.forEach((coord) => {
        this.grids[coord[0]][coord[1]].status = 'seized'
      })
      this.movingCoords = []

      this.checkMatch()
    },
    checkMatch() {
      const matchedRowIndexs = []
      const matchedRows = []
      this.grids.forEach((grid,index) => {
        let matched = true
        grid.forEach((col) => {
          if (col.status !== 'seized') matched = false
        })
        if (matched) {
          matchedRowIndexs.push(index);
          
          const item = grid.map(() => {
            return { status: '', type: '' }
          })
          matchedRows.push(item)
        }
      })
      matchedRowIndexs.forEach(row=>{
        this.grids.splice(row, 1);
        this.score = this.score+10
      })
      matchedRows.forEach(row=>{
        this.grids.unshift(row)
      })
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

      this.generateNewBlock()
    },
    changeDirection() {
      const currDirection = this.tempMovingItem.direction
      currDirection === 3
        ? (this.tempMovingItem.direction = 0)
        : (this.tempMovingItem.direction += 1)

      this.renderBlocks()
    }
  }
}
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

.item1 {
  background-image: url('@/assets/images/items/blocks.png');
}

.item2 {
  background-image: url('@/assets/images/items/ignore.png');
}

.item3 {
  background-image: url('@/assets/images/items/prohibition.png');
}

.item4 {
  background-image: url('@/assets/images/items/refresh.png');
}

.item5 {
  background-image: url('@/assets/images/items/speedometer.png');
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
.elLeft {
  background: #8e44ad;
}
.elRight {
  background: #16a085;
}
</style>
