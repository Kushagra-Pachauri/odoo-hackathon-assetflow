import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user exists and has an ID
    if (!user?.id) return;

    const newSocket = io("http://localhost:4000", {
      withCredentials: true,
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      // Backend uses 'join' with the employee ID
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [user]);

  return socket;
}