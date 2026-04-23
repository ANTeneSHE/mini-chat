const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const MESSAGES_FILE = "./messages.json";

// загрузка истории
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
}

function saveMessages() {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

io.on("connection", (socket) => {
  console.log("Пользователь подключился");

  socket.on("join", (username) => {
    socket.username = username;

    // отправляем историю новому пользователю
    socket.emit("history", messages);
  });

  socket.on("message", (msg) => {
  const now = new Date();

  const mskTime = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  const fullMessage = {
    user: socket.username || "Аноним",
    text: msg.text,
    time: mskTime
  };

  messages.push(fullMessage);
  saveMessages();

  io.emit("message", fullMessage);
});

  socket.on("disconnect", () => {
    console.log("Пользователь отключился");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});