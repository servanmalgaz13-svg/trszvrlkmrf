const socket = io();

let myID = null;
let state = {};

socket.emit("qrJoin"); // 🔥 otomatik giriş

socket.on("assignedID", (id) => {
  myID = id;
  document.getElementById("idBox").innerText = "ID: " + id;
});

socket.on("state", (data) => {
  state = data;
  document.getElementById("text").value = state.text;
});

socket.on("errorMsg", (msg) => {
  alert(msg);
});

function send() {
  socket.emit("update", {
    text: document.getElementById("text").value
  });
}