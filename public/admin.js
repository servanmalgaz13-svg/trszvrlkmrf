const socket = io();
let state = {};
let chart;

socket.on("state", (data) => {
  state = data;

  document.getElementById("state").innerHTML =
    `Tur: ${state.turn}/${state.max} | Metin: ${state.text}`;

  document.getElementById("ai").innerText = state.aiComment;

  renderChart();
  renderHistory();
});

function start() {
  socket.emit("start", {
    text: document.getElementById("startText").value
  });
}

function renderChart() {
  if (!state.analytics.lengthTrend.length) return;

  const labels = state.analytics.lengthTrend.map(x => x.step);
  const data = state.analytics.lengthTrend.map(x => x.length);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Kelime Uzunluğu Evrimi",
        data,
        borderColor: "#00ffcc"
      }]
    }
  });
}

function renderHistory() {
  document.getElementById("history").innerHTML =
    state.history.map(h =>
      `🟢 ${h.turn}. ${h.before} → ${h.after} (${h.type})`
    ).join("<br>");
}