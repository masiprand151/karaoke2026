import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";

import "antd/dist/reset.css";
import { AlertProvider } from "./contexts/AlertContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfirmProvider>
      <AlertProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AlertProvider>
    </ConfirmProvider>
  </StrictMode>,
);
