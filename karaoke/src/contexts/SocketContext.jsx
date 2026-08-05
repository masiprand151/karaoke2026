import { createContext, useContext, useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function initSocket() {
      const setting = await window.electron.getSetting();

      if (!active) return;

      const serverUrl = setting.server;
      const roomId = setting.roomId;
      const name = setting.roomName;

      const s = io(serverUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => {
        console.log("SOCKET CONNECTED:", s.id);

        setConnected(true);

        // REGISTER/JOIN SETIAP CONNECT
        // termasuk setelah reconnect
        s.emit("cashier-join", {
          roomId,
        });
      });

      s.on("disconnect", (reason) => {
        console.log("SOCKET DISCONNECTED:", reason);

        setConnected(false);
      });
    }

    initSocket();

    return () => {
      active = false;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
