import { Modal, Form, InputNumber, Input } from "antd";
import { useState, useEffect } from "react";

function EditFnbModal({ open, onClose, fnb, onSave }) {
  const [form] = Form.useForm();

  // isi form dengan data awal
  useEffect(() => {
    if (fnb) {
      form.setFieldsValue({
        name: fnb.fnb.name,
        quantity: fnb.quantity,
      });
    }
  }, [fnb]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave({ ...fnb, ...values });
      onClose();
    });
  };

  return (
    <Modal
      title="Edit F&B"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Batal"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Nama F&B" name="name">
          <Input value={fnb?.fnb?.name} disabled />
        </Form.Item>
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Masukkan quantity" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditFnbModal;
