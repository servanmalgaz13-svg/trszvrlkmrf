const socket = io();
let state = {};

socket.on("state", (data) => {
  state = data;

  document.getElementById("state").innerHTML =
    `Tur: ${state.turn}<br>Metin: ${state.text}`;
});

function start() {
  socket.emit("start", {
    text: document.getElementById("startText").value
  });
}