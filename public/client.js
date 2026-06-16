const socket = io();

let myID = null;
let state = {};

socket.on("assignedID", (id) => {
  myID = id;
  document.getElementById("idBox").innerText = "🎯 ID: " + id;
});

socket.on("state", (data) => {
  state = data;

  document.getElementById("info").innerText =
    `Tur: ${state.turn}/${state.max}`;

  document.getElementById("text").value = state.text;
});

socket.on("errorMsg", (msg) => {
  const el = document.getElementById("msg");
  el.innerText = msg;

  setTimeout(() => el.innerText = "", 3000);
});

function send() {
  socket.emit("update", {
    text: document.getElementById("text").value
  });

  // ✅ başarı mesajı (frontend feedback)
  document.getElementById("msg").innerText =
    "✅ Cevabın gönderildi";

  setTimeout(() => {
    document.getElementById("msg").innerText = "";
  }, 2000);
}