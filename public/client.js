const socket = io();

socket.on("state", (state) => {

  document.getElementById("words").innerHTML =
    `<div class="mainWords">
      ${state.words[0]} | ${state.words[1]}
    </div>`;
});

function send() {
  const text = document.getElementById("text").value;

  socket.emit("submit", text);

  document.getElementById("text").value = "";
}