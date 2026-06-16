const socket = io();

socket.on("state", (state) => {

  document.getElementById("main").innerHTML =
    `<div class="mainWords">
      ${state.words[0]} — ${state.words[1]}
    </div>`;

  const cloud = document.getElementById("cloud");

  cloud.innerHTML = state.inputs
    .map(word => `<div class="word">${word}</div>`)
    .join("");
});