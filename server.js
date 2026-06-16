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

let users = {};
let queue = [];

function aiAnalyze(before, after) {
  const responses = [
    "Anlam genişledi, metin adeta nefes aldı 🌬️",
    "Cümle evrim geçirdi, artık daha canlı 🧬",
    "Bir kelime daha ekleseydik roman olurdu 📖",
    "Metin sadeleşti, Zen seviyesine yaklaştı 🧘",
    "Anlam kırıldı ama güzel kırıldı ✨",
    "Bu değişim biraz ‘şiir modu’na kaymış 🎭",
    "Dil bilimciler bunu görünce heyecanlanırdı 🤓",
    "Anlam yön değiştirdi, rota şaştı ama eğlenceli 🚀",
    "Metin artık daha agresif / daha yumuşak — denge bozuldu ⚖️"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

io.on("connection", (socket) => {

  // 🔥 OTOMATİK ID (artık QR buton yok)
  const id = queue.length + 1;
  queue.push(id);

  users[socket.id] = {
    id,
    used: false
  };

  socket.emit("assignedID", id);
  socket.emit("state", state);

  // START
  socket.on("start", (data) => {

    if (!data.text || data.text.trim() === "") {
      socket.emit("errorMsg", "⚠️ Etkinlik başlamadı: kelime girilmedi");
      return;
    }

    state = {
      text: data.text,
      turn: 1,
      max: 36,
      locked: false,
      history: [],
      ai: "Etkinlik başladı 🚀"
    };

    users = {};
    queue = [];

    io.emit("state", state);
  });

  // UPDATE
  socket.on("update", (data) => {

    const user = users[socket.id];
    if (!user) return;

    if (state.locked) return;

    if (user.used) {
      socket.emit("errorMsg", "❌ Cevap gönderildi. Yalnızca 1 hakkın var.");
      return;
    }

    if (user.id !== state.turn) {
      socket.emit("errorMsg", "⛔ Sıra sende değil");
      return;
    }

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