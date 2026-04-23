const socket = io();

const input = document.getElementById("input");
const messages = document.getElementById("messages");

socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.textContent = msg;
  messages.appendChild(div);
});

function sendMessage() {
  const msg = input.value;
  if (!msg) return;

  socket.emit("message", msg);
  input.value = "";
}