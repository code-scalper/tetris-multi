<template>
  <div ref="wrapper">
    <div class="ready-wrapper">
      <h1 class="text-[76px]">TETRIS</h1>
      <div class="flex space-x-2">
        <input type="text" v-model="userName" class="min-h-[40px] rounded text-stone-700 p-2" />
        <button class="bg-green-600 p-2 rounded" @click="handleNameInput">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRegisterScreen',
  data() {
    return {
      userName: ''
    }
  },
  methods: {
    handleNameInput() {
      if (this.userName.trim().length === 0) return

      this.$emit('setUserName', this.userName)
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
</style>
