<script setup>
import PlayGround from './PlayGround.vue'
import GameOverScreen from './GameOverScreen.vue'
</script>
<template>
  <div class="flex justify-start items-center flex-col game-wrapper">
    <!-- <p class="text-[50px] text-white">state : {{ connected }}</p> -->
    <button class="text-white bg-emerald-500 p-2 mt-10 hover:bg-red-400" v-if="!isPlaying" @click="startGame">Start Game</button>
    <div class="mt-10">
      <h2>
        <img src="@/assets/images/title.png" alt="tetris" />
      </h2>
    </div>
    <div class="flex space-x-20 mt-10">
      <PlayGround
        type="player"
        :is-playing="isPlaying"
        @gameOver="gameOver"
        :userName="userName"
        @handleOpponentEvent="handleOpponentEvent"
        ref="playerGround"
      />
      <PlayGround
        type="opponent"
        :is-playing="isPlaying"
        :userName="opponentName"
        ref="opponentGround"
      />
    </div>
    <GameOverScreen v-if="gameStatus === 'over'" />
  </div>
</template>

<script>
import { state, socket } from '@/socket'
export default {
  name: 'TetrisScreen',
  props: {
    userName: {
      type: String,
      default: 'Player'
    },
    // opponentName: {
    //   type: String,
    //   default: 'Player'
    // }
  },
  data() {
    return {
      isPlaying: false,
      gotName: false,
      gameStatus: 'wait',
      opponentName: "Player",
    }
  },
  watch: {
    connectionState: {
      handler(val) {
        const event = val.gameEvents[val.gameEvents.length - 1][0]
        if (event.userName === this.userName) return
        this.handleOpponent(event)
      },
      deep: true
    }
  },
  computed: {
    connectionState() {
      return state
    },
    connected() {
      return state.connected
    }
  },
  created() {
    console.log(state.connected, '@@@@@@@@')
  },
  mounted(){
    this.init()
  },
  methods: {
    init(){
      socket.emit('GAME_ROOM', { userName: this.userName, action: 'joinUser', param: {user: this.userName} })
    },
    gameOver() {
      this.gameStatus = 'over'
    },
    startGame(){
      this.$refs.playerGround.init()
      this.isPlaying = true;
      socket.emit('GAME_ROOM', { userName: this.userName, action: 'startGame' })
    },
    handleTest() {
      socket.emit('GAME_ROOM', { userName: this.userName, action: 'TEST', message: 'Hello' })
    },
    handleOpponent(event) {
      const { action, param } = event
      switch (action) {
        case 'renderSync':
          this.$refs.opponentGround.renderSync(param)
          break
        case 'joinUser':
           console.log(param, 'param')
          if(!this.gotName){
            this.init()
            this.gotName = true;
          }
          this.opponentName = param.user;
          break
        case 'startGame':
          this.$refs.playerGround.init()
          // this.$refs.opponentGround.init()
          this.isPlaying = true;
          break
        default:
          break
      }
    },
    handleOpponentEvent(option) {
      socket.emit('GAME_ROOM', { userName: this.userName, ...option })
    }
  }
}
</script>
<style scoped>
.game-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/game-bg-2.png') no-repeat center;
  background-size: cover;
  overflow-y: auto;
}
</style>
