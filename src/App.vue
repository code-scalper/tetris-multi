<script setup>
import UserRegisterScreen from './components/UserRegisterScreen.vue'
import SplashScreen from './components/SplashScreen.vue'
import TetrisScreen from './components/tetris/TetrisScreen.vue'
</script>

<template>
  <div>
    <div class="w-screen m-0 p-0" v-if="userName === null">
      <UserRegisterScreen @setUserName="setUserName" />
    </div>
    <div class="w-screen m-0 p-0" v-else>
      <SplashScreen v-if="!isGameReady" @setGameReady="setGameReady" />
      <TetrisScreen v-else :userName="userName" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      isGameReady: false,
      userName: null
    }
  },
  created() {},
  methods: {
    setGameReady() {
      this.isGameReady = true
    },
    setUserName(name) {
      this.userName = name
    }
  }
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}
.logo {
  display: block;
}

@media (min-width: 1024px) {
}
</style>
