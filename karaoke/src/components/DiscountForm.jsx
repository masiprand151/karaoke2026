import { useState } from "react";
import { Modal, Form, InputNumber, Button, App, Space, message } from "antd";
import api from "../utils/api";
import { useConfirm } from "../contexts/ConfirmContext";
import { useAlert } from "../contexts/AlertContext";

function DiscountForm({ transactionId, onClose, open }) {
  const { modal, message } = App.useApp();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();
  const handleDiscount = async () => {
    const confirmed = await showConfirm({
      title: "Discount",
      description: `Apa kamu yakin ingin memberikan discount room sebesar ${count}%?`,
    });

    if (!confirmed) {
      setCount(0);
      onClose();
      return;
    }

    try {
      setLoading(true);

      await api.post("/session/discount", {
        transactionId: Number(transactionId),
        discount: Number(count),
      });

      showAlert({
        type: "success",
        message: "Berhasil melakukan discount",
      });
      onClose();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Room Discount"
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={400}
    >
      <Form layout="vertical">
        <Form.Item label="Discount (%)">
          <Space.Compact style={{ width: "100%" }}>
            <InputNumber
              min={0}
              max={100}
              value={count}
              onChange={(value) => setCount(value ?? 0)}
              addonAfter="%"
              style={{ width: "100%" }}
            />
          </Space.Compact>
        </Form.Item>

        <Button type="primary" block loading={loading} onClick={handleDiscount}>
          Discount Now
        </Button>
      </Form>
    </Modal>
  );
}

export default DiscountForm;
