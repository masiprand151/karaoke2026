import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";

import "antd/dist/reset.css";
import { AlertProvider } from "./contexts/AlertContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { SocketProvider } from "./contexts/SocketContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <ConfirmProvider>
        <AlertProvider>
          <PlaylistProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </PlaylistProvider>
        </AlertProvider>
      </ConfirmProvider>
    </SocketProvider>
  </StrictMode>,
);
