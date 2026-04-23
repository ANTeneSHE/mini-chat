const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// подключение к базе
const db = new sqlite3.Database("./chat.db");

// создаём таблицу, если нет
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    text TEXT,
    time TEXT
  )
`);

io.on("connection", (socket) => {
  console.log("Пользователь подключился");

  socket.on("join", (username) => {
    socket.username = username;

    // отправляем историю из базы
    db.all("SELECT * FROM messages ORDER BY id ASC", [], (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }
      socket.emit("history", rows);
    });
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

    // сохраняем в базу
    db.run(
      "INSERT INTO messages (user, text, time) VALUES (?, ?, ?)",
      [user, text, mskTime],
      function (err) {
        if (err) {
          console.error(err);
          return;
        }

        const fullMessage = {
          id: this.lastID,
          user,
          text,
          time: mskTime
        };

        io.emit("message", fullMessage);
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключился");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});