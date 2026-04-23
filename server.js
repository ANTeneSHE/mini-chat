const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Database = require("better-sqlite3");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// подключение к базе
const db = new Database("chat.db");

// создаём таблицу
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    text TEXT,
    time TEXT
  )
`).run();

io.on("connection", (socket) => {
  console.log("Пользователь подключился");

  socket.on("join", (username) => {
    socket.username = username;

    const rows = db.prepare("SELECT * FROM messages ORDER BY id ASC").all();
    socket.emit("history", rows);
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

    const user = socket.username || "Аноним";
    const text = msg.text;

    const result = db
      .prepare("INSERT INTO messages (user, text, time) VALUES (?, ?, ?)")
      .run(user, text, mskTime);

    const fullMessage = {
      id: result.lastInsertRowid,
      user,
      text,
      time: mskTime
    };

    io.emit("message", fullMessage);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});