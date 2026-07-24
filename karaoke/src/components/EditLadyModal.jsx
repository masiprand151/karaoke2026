import { Modal, Form, InputNumber, Input } from "antd";
import { useState, useEffect } from "react";

function EditLadyModal({ open, onClose, lady, onSave }) {
  const [form] = Form.useForm();

  // isi form dengan data awal
  useEffect(() => {
    if (lady) {
      form.setFieldsValue({
        name: lady.lady.name,
        quantity: lady.quantity,
      });
    }
  }, [lady]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave({ ...lady, ...values });
      onClose();
    });
  };

  return (
    <Modal
      title="Edit Lady"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Batal"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama Lady" name="name">
          <Input value={lady?.lady?.name} disabled />
        </Form.Item>
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Masukkan duration" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditLadyModal;
