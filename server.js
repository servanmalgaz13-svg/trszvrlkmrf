const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/admin", (req, res) => res.sendFile(__dirname + "/public/admin.html"));
app.get("/present", (req, res) => res.sendFile(__dirname + "/public/present.html"));

let state = {
  text: "",
  turn: 0,
  max: 36,
  locked: false,
  history: [],
  ai: ""
};

let queue = [];
let users = {};

function aiAnalyze(before, after) {
  if (!before) return "Başlangıç metni oluşturuldu.";
  if (after.length > before.length) return "Anlam genişledi ve ifade zenginleşti.";
  if (after.length < before.length) return "Metin sadeleşti ve yoğunluk azaldı.";
  return "Anlam dönüşümü gerçekleşti.";
}

io.on("connection", (socket) => {

  socket.emit("state", state);

  // 📲 QR giriş = otomatik ID
  socket.on("qrJoin", () => {

    const id = queue.length + 1;
    queue.push(id);

    users[socket.id] = {
      id,
      used: false
    };

    socket.emit("assignedID", id);
  });

  // 🎬 başlat
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

  // ✍️ cevap
  socket.on("update", (data) => {

    const user = users[socket.id];
    if (!user) return;

    // 🔒 sıra kontrolü
    if (user.id !== state.turn) {
      socket.emit("errorMsg", "Sıra sana gelmedi");
      return;
    }

    // 🔒 tek hak
    if (user.used) {
      socket.emit("errorMsg", "Cevap için yalnızca bir hakkın var");
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
    }, 500);
  });

});

server.listen(process.env.PORT || 3000);