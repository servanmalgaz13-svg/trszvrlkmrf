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
  words: ["", ""],
  inputs: []
};

io.on("connection", (socket) => {

  socket.emit("state", state);

  // ADMIN → 2 kelime belirler
  socket.on("setWords", (data) => {
    state.words = [data.w1, data.w2];
    state.inputs = [];
    io.emit("state", state);
  });

  // KATILIMCI → veri gönderir
  socket.on("submit", (text) => {
    if (!text || text.trim() === "") return;

    state.inputs.push(text.trim());

    io.emit("state", state);
  });

});

server.listen(process.env.PORT || 3000);