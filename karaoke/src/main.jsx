import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";

import "antd/dist/reset.css";
import { AlertProvider } from "./contexts/AlertContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { NotificationProvider } from "./contexts/useNotification";
import { SocketProvider } from "./contexts/SocketContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <NotificationProvider>
        <ConfirmProvider>
          <AlertProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </AlertProvider>
        </ConfirmProvider>
      </NotificationProvider>
    </SocketProvider>
  </StrictMode>,
);
