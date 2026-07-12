import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  autoConnect: true,
});

export function useSocket() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return socket;
}