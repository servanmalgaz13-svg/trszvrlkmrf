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
  history: []
};

// tek kullanım kontrolü
let users = {};

io.on("connection", (socket) => {

  socket.emit("state", state);

  // kullanıcı kaydı
  socket.on("join", (name) => {
    if (users[name]) {
      socket.emit("errorMsg", "Bu isim zaten kullanıldı");
      return;
    }

    users[name] = {
      used: false,
      id: socket.id
    };

    socket.name = name;
  });

  // başlat
  socket.on("start", (data) => {
    state = {
      text: data.text,
      turn: 1,
      max: 36,
      locked: false,
      history: []
    };

    users = {};

    io.emit("state", state);
  });

  // update
  socket.on("update", (data) => {

    const user = socket.name;
    if (!user) return;

    if (users[user].used) {
      socket.emit("errorMsg", "Sadece 1 kez yazabilirsin");
      return;
    }

    if (state.locked) return;

    users[user].used = true;
    state.locked = true;

    state.history.push({
      turn: state.turn,
      before: state.text,
      after: data.text
    });

    state.text = data.text;
    state.turn++;

    io.emit("state", state);

    setTimeout(() => {
      state.locked = false;
      io.emit("state", state);
    }, 500);

  });

});

server.listen(process.env.PORT || 3000);