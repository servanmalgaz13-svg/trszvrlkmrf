const socket = io();

let state = {};
let myID = null;

function joinQR() {
  socket.emit("joinQR");
}

socket.on("assignedID", (id) => {
  myID = id;
  document.getElementById("myID").innerText = "ID: " + id;
});

socket.on("state", (data) => {
  state = data;

  document.getElementById("info").innerText =
    `Tur: ${state.turn}/${state.max}`;

  document.getElementById("text").value = state.text;
});

function send() {
  socket.emit("update", {
    text: document.getElementById("text").value
  });
}