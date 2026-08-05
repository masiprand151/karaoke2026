// useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (url, options = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // connect ke server
    socketRef.current = io(url, options);

    // log connect/disconnect
    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);
    });
    socketRef.current.on("disconnect", () => {
      console.log("Disconnected");
    });

    // cleanup saat unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  // helper emit
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  // helper on
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  return { socket: socketRef.current, emit, on };
};
