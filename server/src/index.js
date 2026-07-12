import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import pool from "./db/db.js";

dotenv.config();

// Test PostgreSQL connection
try {
  const result = await pool.query("SELECT NOW()");
  console.log("PostgreSQL Connected");
  console.log(result.rows[0]);
} catch (err) {
  console.error("Database Error:", err);
}

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});