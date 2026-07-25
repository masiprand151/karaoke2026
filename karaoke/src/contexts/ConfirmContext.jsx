import { createContext, useContext, useRef, useState } from "react";
import { Modal } from "antd";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const resolver = useRef();

  const [state, setState] = useState({
    open: false,
    title: "",
    description: "",
  });

  const confirm = ({ title, description }) => {
    return new Promise((resolve) => {
      resolver.current = resolve;

      setState({
        open: true,
        title,
        description,
      });
    });
  };

  const handleOk = () => {
    resolver.current?.(true);

    setState((s) => ({
      ...s,
      open: false,
    }));
  };

  const handleCancel = () => {
    resolver.current?.(false);

    setState((s) => ({
      ...s,
      open: false,
    }));
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm: confirm }}>
      <Modal
        open={state.open}
        title={state.title}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnHidden
      >
        {state.description}
      </Modal>

      {children}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
