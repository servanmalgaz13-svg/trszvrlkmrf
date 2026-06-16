const socket = io();

socket.on("state", (state) => {

  document.getElementById("bigText").innerText = state.text;

  document.getElementById("aiBox").innerText =
    "🧠 AI Analiz: " + state.ai;

  document.getElementById("historyBox").innerHTML =
    state.history.slice(-10).map(h =>
      `🔵 ${h.turn}. ${h.before} → ${h.after}`
    ).join("<br>");
});