const socket = io();

socket.on("state", (state) => {

  document.getElementById("bigText").innerText = state.text;

  document.getElementById("historyBox").innerHTML =
    state.history.slice(-8).map(h =>
      `<div>${h.turn}. ${h.before} → ${h.after}</div>`
    ).join("");
});