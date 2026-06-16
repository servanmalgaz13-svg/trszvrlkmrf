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

app.get("/join/:id", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let state = {
  text: "",
  turn: 0,
  max: 36,
  locked: false,

  history: [],

  analytics: {
    lengthTrend: [],
    changeTypes: { add: 0, remove: 0, edit: 0 }
  },

  aiComment: ""
};

// 🧠 basit AI yorum sistemi
function generateAIComment(before, after) {
  if (!before) return "Başlangıç metni oluşturuldu.";
  if (after.length > before.length) return "Metin genişledi, anlam alanı büyüdü.";
  if (after.length < before.length) return "Metin sadeleşti, yoğunluk azaldı.";
  return "Anlam dönüşümü gerçekleşti.";
}

io.on("connection", (socket) => {

  socket.emit("state", state);

  socket.on("start", (data) => {
    state = {
      text: data.text,
      turn: 1,
      max: 36,
      locked: false,
      history: [],
      analytics: {
        lengthTrend: [],
        changeTypes: { add: 0, remove: 0, edit: 0 }
      },
      aiComment: "Etkinlik başladı."
    };

    io.emit("state", state);
  });

  socket.on("update", (data) => {

    if (state.turn >= state.max) return;
    if (state.locked) return;

    state.locked = true;

    const before = state.text;
    const after = data.text;

    const beforeWords = before.split(" ").length;
    const afterWords = after.split(" ").length;

    let type = "edit";
    if (afterWords > beforeWords) type = "add";
    if (afterWords < beforeWords) type = "remove";

    state.analytics.changeTypes[type]++;

    state.history.push({
      turn: state.turn,
      before,
      after,
      type
    });

    state.text = after;
    state.turn++;

    state.analytics.lengthTrend.push({
      step: state.turn,
      length: afterWords
    });

    state.aiComment = generateAIComment(before, after);

    io.emit("state", state);

    setTimeout(() => {
      state.locked = false;
      io.emit("state", state);
    }, 500);

  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("RUNNING"));