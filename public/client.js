const socket = io(window.location.origin);

// спрашиваем имя при входе
const username = prompt("Введи своё имя:");

const input = document.getElementById("input");
const messages = document.getElementById("messages");

// отправляем имя на сервер
socket.emit("join", username);

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.textContent = `${data.user}: ${data.text}`;
  messages.appendChild(div);
});

function sendMessage() {
  const msg = input.value;
  if (!msg) return;

  socket.emit("message", {
    text: msg
  });

  input.value = "";
}