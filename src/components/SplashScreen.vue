<template>
  <div ref="wrapper">
    <div class="ready-wrapper">
      <h1 class="text-[76px]">TETRIS</h1>
      <p class="">press any key to start!!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashScreen',
  unmounted() {
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeyPress)
  },
  methods: {
    handleKeyPress() {
      this.$emit('setGameReady')
    }
  }
}
</script>

<style scoped>
.ready-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/bg.jpeg') no-repeat center;
  background-size: cover;
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.ready-wrapper > h1 {
  font-size: 78px;
  padding-bottom: 1em;
  text-shadow: 2px 4px 2px #333;
}
.ready-wrapper > p {
  animation-name: textBlink;
  animation-duration: 2s;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
}
@keyframes textBlink {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
