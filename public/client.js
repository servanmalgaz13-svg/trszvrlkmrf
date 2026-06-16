const socket = io();
let state = {};

function join() {
  const name = document.getElementById("name").value;
  socket.emit("join", name);
}

socket.on("state", (data) => {
  state = data;

  document.getElementById("info").innerText =
    `Tur: ${state.turn}/${state.max}`;

  const enabled = !state.locked;

  document.getElementById("text").disabled = !enabled;
  document.getElementById("btn").disabled = !enabled;
});

function send() {
  socket.emit("update", {
    text: document.getElementById("text").value
  });
}