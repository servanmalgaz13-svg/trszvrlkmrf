const socket = io();

socket.on("state", (state) => {
  document.getElementById("state").innerHTML =
    `Tur: ${state.turn}<br>${state.text}`;
});

socket.on("errorMsg", (msg) => {
  alert(msg);
});

function start() {
  const text = document.getElementById("startText").value;

  socket.emit("start", { text });
}