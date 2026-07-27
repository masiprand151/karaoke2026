import { useState } from "react";
import useLadies from "../../hooks/useLadies";
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
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SyncOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useAlert } from "../../contexts/AlertContext";
import InputPrice from "../../components/InputPrice";
import api from "../../utils/api";

const { Title } = Typography;
const { Search } = Input;

export default function Lady() {
  const { ladies, query, setQuery, getLadies } = useLadies();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLady, setEditingLady] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // buka modal tambah/edit
  const openModal = (lady = null) => {
    setEditingLady(lady);
    setIsModalOpen(true);
    if (lady) {
      form.resetFields();
      form.setFieldsValue(lady);
    } else {
      form.resetFields();
    }
  };

  const handleSave = async (v) => {
    try {
      const value = form.getFieldValue();
      if (editingLady) {
        // update
        await api.put(`/lady/${editingLady.id}`, value);
        showAlert({
          type: "success",
          message: "Berhasil update lady",
        });
      } else {
        // create
        await api.post("/lady", value);
        showAlert({
          type: "success",
          message: "Berhasil tambah lady",
        });
      }
      setIsModalOpen(false);
      setEditingLady(null);
      getLadies();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lady/${id}`);

      showAlert({
        type: "success",
        message: "Berhasil delete lady",
      });
      getLadies();
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
          title="Lady Companion"
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
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            Tambah Lady
          </Button>
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 550 }}
            rowKey="id"
            dataSource={ladies}
            columns={[
              {
                title: "Nama",
                dataIndex: "name",
              },
              {
                title: "Harga",
                render: (_, row) => formatRp(row.basePrice),
              },
              {
                title: "Status",
                width: 120,
                align: "center",
                render: (_, row) =>
                  row.isJob ? (
                    <Tag
                      key={"success"}
                      color={"success"}
                      icon={<SyncOutlined spin />}
                      variant={"solid"}
                    ></Tag>
                  ) : (
                    <Tag
                      key={"error"}
                      color={"error"}
                      icon={<CloseCircleOutlined />}
                      variant={"solid"}
                    ></Tag>
                  ),
              },
              {
                title: "",
                key: "action",
                render: (_, row) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openModal(row)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Yakin hapus user ini?"
                      onConfirm={() => handleDelete(row.id)}
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        Hapus
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>

      <Modal
        title={editingLady ? "Edit Lady" : "Tambah Lady"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
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
          {editingLady && (
            <Form.Item name={"isJob"} label="Status">
              <Switch
                checkedChildren="On"
                unCheckedChildren="Off"
                defaultChecked
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Row>
  );
}
