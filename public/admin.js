const socket = io();

socket.on("state", (state) => {
  document.getElementById("state").innerHTML =
    `Tur: ${state.turn}<br>${state.text}`;
});

function start() {
  socket.emit("start", {
    text: document.getElementById("startText").value
  });
}