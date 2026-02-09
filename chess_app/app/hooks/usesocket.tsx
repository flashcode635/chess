"use client";
import { useEffect, useState } from "react";

export const useSocket = () => {
    const url = process.env.NEXT_PUBLIC_WSS_URL;
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${url}`);
    console.log("WebSocket created", ws);
    ws.onopen = () => {
        console.log("WebSocket opened");
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => ws.close();
  }, []);
console.log("Socket:", socket);
  return socket;
};
