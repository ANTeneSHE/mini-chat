const socket = io(window.location.origin);

if ("Notification" in window) {
  Notification.requestPermission();
}

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

socket.on("message", (data) => {
  renderMessage(data);

  console.log("TEST MESSAGE:", data);

  new Notification("ТЕСТ УВЕДОМЛЕНИЯ", {
    body: data.text
  });
});

/*
// новые сообщения
socket.on("message", (data) => {
  renderMessage(data);

  // не уведомляем о своих сообщениях
  if (data.user === username) return;

  // не показываем, если вкладка активна
  if (document.visibilityState === "visible") return;

  // показываем уведомление
  if (Notification.permission === "granted") {
    const notification = new Notification(`Новое сообщение от ${data.user}`, {
      body: data.text
    });

    notification.onclick = () => {
      window.focus();
    };
  }
});
*/

function sendMessage() {
  const msg = input.value;
  if (!msg) return;

  socket.emit("message", {
    text: msg
  });

  input.value = "";
}