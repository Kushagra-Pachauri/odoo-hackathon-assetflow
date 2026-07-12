import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import pool from "./db/db.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

// Test PostgreSQL Connection
try {
  const result = await pool.query("SELECT NOW()");
  console.log("PostgreSQL Connected");
  console.log(result.rows[0]);
} catch (err) {
  console.error("Database Error:", err);
}

const PORT = process.env.PORT || 4000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});