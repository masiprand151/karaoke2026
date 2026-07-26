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

const { Title } = Typography;
const { Search } = Input;

export default function Lady() {
  const { ladies, query, setQuery } = useLadies();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLady, setEditingLady] = useState(null);
  const [price, setPrice] = useState(0);
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
    console.log(form.getFieldValue());
  };

  const handleDelete = async (id) => {};

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
                    >
                      jj
                    </Tag>
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
                render: (_, r) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openModal(r)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Yakin hapus user ini?"
                      onConfirm={() => handleDelete(r.id)}
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
        </Form>
      </Modal>
    </Row>
  );
}
