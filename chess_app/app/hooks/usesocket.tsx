"use client";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_WSS_URL as string;  
export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!url) {
      console.error("NEXT_PUBLIC_WSS_URL is not defined");
      return;
    }

    const ws = new WebSocket(url);
    console.log("WebSocket created", ws);
    
    ws.onopen = () => {
      console.log("WebSocket opened");
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };

    return () => ws.close();
  }, [url]);
console.log("Socket:", socket);
  return socket;
};
