import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRp } from "../../utils/rupiah";
import {
  Row,
  Col,
  Card,
  Table,
  Typography,
  Input,
  Flex,
  Button,
  Form,
  Modal,
  Popconfirm,
  Space,
  Tag,
  InputNumber,
  Switch,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SyncOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  DropboxOutlined,
} from "@ant-design/icons";
import { useAlert } from "../../contexts/AlertContext";
import InputPrice from "../../components/InputPrice";
import api from "../../utils/api";
import useFnbs from "../../hooks/useFnbs";
import PurchaseForm from "../../components/PurchaseForm";
import InputNumberic from "../../components/InputNumberic";

const { Title } = Typography;
const { Search, TextArea } = Input;

export default function Fnb() {
  const { fnbs, query, setQuery, getFnbs } = useFnbs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurcase, setIsPurcase] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingFnb, setEditingFnb] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // buka modal tambah/edit
  const openModal = (fnb = null) => {
    setEditingFnb(fnb);
    setIsModalOpen(true);
    if (fnb) {
      form.resetFields();
      form.setFieldsValue(fnb);
    } else {
      form.resetFields();
    }
  };

  const handleSave = async (v) => {
    try {
      const value = form.getFieldValue();
      if (editingFnb) {
        // update
        await api.put(`/fnb/${editingFnb.id}`, value);
        showAlert({
          type: "success",
          message: "Berhasil update fnb",
        });
      } else {
        // create
        await api.post("/fnb", value);
        showAlert({
          type: "success",
          message: "Berhasil tambah fnb",
        });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingFnb(null);
        window.location.reload();
      }, 2000);
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/fnb/${id}`);
      showAlert({
        type: "success",
        message: "Berhasil delete fnb",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleSavePurcase = async (value) => {
    try {
      const res = await api.post("/fnb/purchase", value);
      showAlert({
        type: "success",
        message: `Stock ${value.name} berhasil di perbarui`,
      });
      setTimeout(() => {
        setIsPurcase(false);
        setSelected(null);
        window.location.reload();
      }, 2000);
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  return (
    <Row
      gutter={16}
      style={{
        height: "100vh",
      }}
    >
      <Col span={24}>
        <Card
          title="F&B"
          style={{
            height: "100%",
          }}
          extra={
            <Flex gap={8} align="center">
              <Search
                placeholder="Search Lady..."
                allowClear
                enterButton
                style={{ width: 250 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Button onClick={() => navigate(-1)}>Back</Button>
            </Flex>
          }
        >
          <Flex gap={"small"}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => openModal()}
              style={{ marginBottom: 16 }}
            >
              Tambah F&B
            </Button>
          </Flex>
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 550 }}
            rowKey="id"
            dataSource={fnbs}
            columns={[
              {
                title: "Nama",
                dataIndex: "name",
              },
              {
                title: "Category",
                dataIndex: "category",
              },
              {
                title: "Harga",
                render: (_, row) => formatRp(row.basePrice),
              },
              {
                title: "Stock",
                dataIndex: "stock",
                // align: "center",
              },
              {
                title: "Aksi",
                align: "center",
                render: (_, row) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<DropboxOutlined />}
                      onClick={() => {
                        setIsPurcase(true);
                        setSelected(row);
                      }}
                      disabled={!row.isStock}
                    />
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openModal(row)}
                    />
                    <Popconfirm
                      title="Yakin hapus product ini?"
                      onConfirm={() => handleDelete(row.id)}
                    >
                      <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>

      <Modal
        title={editingFnb ? "Edit Fnb" : "Tambah Fnb"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: "other", // default kategori
            taxRate: 10,
            serviceCharge: 5,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="basePrice"
            label="Price"
            rules={[
              { required: true, message: "Price/Harga wajib diisi" },
              { type: "number", message: "Harga harus berupa angka" },
            ]}
          >
            <InputPrice />
          </Form.Item>

          <Form.Item name={"category"} label="Kategori">
            <Select
              options={[
                { value: "other", label: "Other" },
                {
                  value: "food",
                  label: "Food",
                },
                {
                  value: "drink",
                  label: "Drink",
                },
                {
                  value: "snack",
                  label: "Snack",
                },
              ]}
            />
          </Form.Item>

          {editingFnb && (
            <>
              <Form.Item name={"stock"} label="Stock">
                <InputNumberic />
              </Form.Item>

              <Form.Item name={"description"} label="Description">
                <TextArea
                  placeholder="Controlled autosize"
                  autoSize={{ minRows: 2, maxRows: 2 }}
                />
              </Form.Item>
            </>
          )}

          <Flex justify="space-between">
            <Form.Item name={"taxRate"} label="Tax">
              <InputNumberic />
            </Form.Item>
            <Form.Item initialValue={5} name={"serviceCharge"} label="Service">
              <InputNumberic />
            </Form.Item>
          </Flex>

          <Form.Item name={"isStock"} label="Include Stock">
            <Switch
              checkedChildren="On"
              unCheckedChildren="Off"
              defaultChecked={false}
            />
          </Form.Item>
        </Form>
      </Modal>

      <PurchaseForm
        open={isPurcase}
        onCancel={() => setIsPurcase(false)}
        data={selected}
        onSave={handleSavePurcase}
      />
    </Row>
  );
}
