import { createContext, useContext, useState } from "react";
import { message } from "antd";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [alert, setAlert] = useState({
    type: "success",
    duration: 10,
    message: "",
  });

  const showAlert = ({ type = "success", duration = 10, message = "" }) => {
    messageApi.open({
      type,
      content: message,
      duration,
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {contextHolder}
      {children}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
