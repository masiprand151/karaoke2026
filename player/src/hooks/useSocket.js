import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export const useSocket = (url, options = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url, options);

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);
    });
    socketRef.current.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketRef.current?.off(event, callback);
  }, []);

  return { socket: socketRef.current, emit, on, off };
};
