const socket = io(window.location.origin);

const username = prompt("Введи своё имя:");

const input = document.getElementById("input");
const messages = document.getElementById("messages");

socket.emit("join", username);

const seen = new Set();

function renderMessage(data) {
  const id = `${data.user}-${data.text}-${data.time}`;

  if (seen.has(id)) return;
  seen.add(id);

  const div = document.createElement("div");

  if (data.time) {
    div.textContent = `[${data.time}] ${data.user}: ${data.text}`;
  } else {
    div.textContent = `${data.user}: ${data.text}`;
  }

  messages.appendChild(div);
}

// история
socket.on("history", (history) => {
  messages.innerHTML = "";
  history.forEach(renderMessage);
});

// новые сообщения
socket.on("message", renderMessage);

function sendMessage() {
  const msg = input.value;
  if (!msg) return;

  socket.emit("message", {
    text: msg
  });

  input.value = "";
}