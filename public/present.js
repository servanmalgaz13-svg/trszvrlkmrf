const socket = io();

socket.on("state", (state) => {

  document.getElementById("bigText").innerText = state.text;

  document.getElementById("meta").innerText =
    `Tur: ${state.turn}/${state.max}`;

  document.getElementById("timeline").innerHTML =
    state.history.slice(-5).map(h =>
      `${h.before} → ${h.after}`
    ).join("<br>");

});