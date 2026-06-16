const socket = io();

function setWords() {
  socket.emit("setWords", {
    w1: document.getElementById("w1").value,
    w2: document.getElementById("w2").value
  });
}