const socket = io();
let state = {};

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "tr-TR";
  speechSynthesis.speak(msg);
}

socket.on("state", (data) => {
  state = data;

  document.getElementById("info").innerHTML =
    `🎯 ${state.turn}/${state.max} | Sıradaki: ${state.turn + 1}`;

  const big = document.getElementById("bigText");

  // 🎬 animasyon
  big.style.opacity = 0;
  setTimeout(() => {
    big.innerText = state.text;
    big.style.opacity = 1;
  }, 200);

  const enabled = !state.locked;

  document.getElementById("text").disabled = !enabled;
  document.getElementById("btn").disabled = !enabled;

  document.getElementById("btn").innerText =
    enabled ? "Gönder" : "🔒 Sıra Bekleniyor";

  document.getElementById("text").value = state.text;

  // 🔊 sesli okuma (sunum etkisi)
  if (state.turn > 1) {
    speak(state.text);
  }

  // 📱 QR link
  document.getElementById("qr").innerHTML =
    "📲 Katılım: /join/" + state.turn;
});

function send() {
  socket.emit("update", {
    text: document.getElementById("text").value
  });
}