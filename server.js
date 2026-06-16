const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

app.get("/present", (req, res) => {
  res.sendFile(__dirname + "/public/present.html");
});

let state = {
  text: "",
  turn: 0,
  max: 36,
  locked: false,
  history: [],
  ai: ""
};

// QR → sıra ID üretir
let queue = [];
let users = {};

function aiAnalyze(before, after) {
  if (!before) return "Başlangıç metni oluşturuldu.";
  if (after.length > before.length) return "Anlam genişledi, ifade zenginleşti.";
  if (after.length < before.length) return "Metin sadeleşti, yoğunluk azaldı.";
  return "Anlam dönüşümü gerçekleşti.";
}

io.on("connection", (socket) => {

  socket.emit("state", state);

  // QR giriş → otomatik ID
  socket.on("joinQR", () => {
    const id = queue.length + 1;

    queue.push(id);
    users[socket.id] = {
      id,
      used: false
    };

    socket.emit("assignedID", id);
  });

  socket.on("start", (data) => {
    state = {
      text: data.text,
      turn: 1,
      max: 36,
      locked: false,
      history: [],
      ai: ""
    };

    queue = [];
    users = {};

    io.emit("state", state);
  });

  socket.on("update", (data) => {

    const user = users[socket.id];
    if (!user) return;

    // sıra kontrolü
    if (user.id !== state.turn) {
      socket.emit("errorMsg", "Sıra sana gelmedi");
      return;
    }

    if (user.used) {
      socket.emit("errorMsg", "Sadece 1 kez yazabilirsin");
      return;
    }

    if (state.locked) return;

    user.used = true;
    state.locked = true;

    const before = state.text;
    const after = data.text;

    state.history.push({
      turn: state.turn,
      before,
      after
    });

    state.text = after;
    state.turn++;

    state.ai = aiAnalyze(before, after);

    io.emit("state", state);

    setTimeout(() => {
      state.locked = false;
      io.emit("state", state);
    }, 400);
  });

});

server.listen(process.env.PORT || 3000);