import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {

  io = new Server(server, {

    cors: {
      origin: "*",
      credentials: true,
    },

  });

  io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);

    socket.on("join", (employeeId) => {

      socket.join(employeeId);

      console.log(`${employeeId} joined`);

    });

    socket.on("disconnect", () => {

      console.log("Socket Disconnected");

    });

  });

};

export { io };