"use client";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_WSS_URL as string;
export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    console.log("WebSocket created", ws);
    ws.onopen = () => {
        console.log("WebSocket opened");
      setSocket(ws);
      console.log("Socket set to WebSocket instance");
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => ws.close();
  }, []);
console.log("Socket:", socket);
  return socket;
};

