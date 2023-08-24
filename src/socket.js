import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  gameEvents: [],
  chatEvents: [],
});

// "undefined" means the URL will be computed from the `window.location` object

// console.log(window.location)
// const url = 'http://192.168.1.17:3000'
const url = "http://localhost:3000";
export const socket = io(url);

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("GAME_ROOM", (...args) => {
  if (state.gameEvents.length === 10) {
    state.gameEvents.pop();
  }

  state.gameEvents.push(args);
});

socket.on("CHAT_ROOM", (...args) => {
  if (state.chatEvents.length === 10) {
    state.chatEvents.pop();
  }
  state.chatEvents.push(args);
});
