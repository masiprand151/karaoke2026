import { Modal, Form, Input, InputNumber, Button } from "antd";
import InputPrice from "./InputPrice";
import { useEffect } from "react";
import InputNumberic from "./InputNumberic";

export default function PurchaseForm({ open, onCancel, onSave, data }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldValue("name", data?.name);
    form.setFieldValue("fnbId", data?.id);
  }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // kirim ke backend
      onSave(values);
      form.resetFields();
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  return (
    <Modal
      title="Tambah Purchase / StockIn"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Simpan"
      cancelText="Batal"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="supplierName"
          label="Nama Supplier"
          rules={[{ required: true, message: "Nama supplier wajib diisi" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="invoiceNumber"
          label="Nomor Nota"
          rules={[{ required: true, message: "Nomor nota wajib diisi" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Nama Barang">
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="fnbId"
          label="ID Barang / Fnb"
          rules={[{ required: true, message: "Barang wajib dipilih" }]}
        >
          <Input disabled />
          {/* Bisa diganti Select untuk pilih barang */}
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Jumlah"
          rules={[{ required: true, message: "Jumlah wajib diisi" }]}
        >
          <InputNumberic />
        </Form.Item>

        <Form.Item
          name="unitPrice"
          label="Harga Satuan"
          rules={[{ required: true, message: "Harga wajib diisi" }]}
        >
          <InputPrice />
        </Form.Item>
      </Form>
    </Modal>
  );
}
