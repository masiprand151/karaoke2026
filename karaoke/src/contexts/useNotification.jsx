// NotificationProvider.js
import React, { createContext, useContext, useMemo } from "react";
import { notification } from "antd";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (title, description, placement = "topLeft") => {
    api.info({
      message: title,
      description,
      placement,
    });
  };

  const contextValue = useMemo(() => ({ showNotification }), [api]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
