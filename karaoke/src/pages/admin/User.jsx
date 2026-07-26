import { useState } from "react";
import useUser from "../../hooks/useUser";
import {
  Form,
  Space,
  Button,
  Popconfirm,
  Table,
  Row,
  Col,
  Card,
  Flex,
  Typography,
  Input,
  Modal,
  Select,
  Checkbox,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAlert } from "../../contexts/AlertContext";

const { Title } = Typography;
const { Search } = Input;

function User() {
  const { users, query, getUsers, setQuery } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRessetPw, setIsRessetPw] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // buka modal tambah/edit
  const openModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // edit user
        await api.put(`/user/${editingUser.id}`, values);
        showAlert({
          type: "success",
          message: "Berhasil update user",
        });
      } else {
        // tambah user
        await api.post("/user", values);
        showAlert({
          type: "success",
          message: "Berhasil tambah user baru",
        });
      }

      setIsModalOpen(false);
      setEditingUser(null);
      // refresh data user setelah sukses
      window.location.reload();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await api.delete(`/user/${userId}`);
      showAlert({
        type: "success",
        message: "Berhasil hapus user",
      });
      window.location.reload();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "",
      key: "action",
      render: (_, r) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(r)}
            disabled={r.username === "administrator"}
          >
            Edit
          </Button>
          <Popconfirm
            title="Yakin hapus user ini?"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={r.username === "administrator"}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Row
      gutter={16}
      style={{
        height: "100vh",
      }}
    >
      <Col span={24}>
        <Card
          style={{ height: "100%" }}
          title="User"
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
            Tambah User
          </Button>
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 550 }}
            rowKey="id"
            dataSource={users}
            columns={columns}
          />
        </Card>
      </Col>
      <Modal
        title={editingUser ? "Edit User" : "Tambah User"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role wajib dipilih" }]}
          >
            <Select placeholder="Pilih role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="cashier">Cashier</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
            </Select>
          </Form.Item>

          {/* Saat edit user, bisa pilih reset password */}
          {editingUser && (
            <>
              <Form.Item name="resetPassword" valuePropName="checked">
                <Checkbox
                  value={isRessetPw}
                  onChange={(e) => setIsRessetPw((prev) => !prev)}
                >
                  Reset password (lupa password)
                </Checkbox>
              </Form.Item>
              {isRessetPw && (
                <>
                  <Form.Item
                    name="oldPassword"
                    label="Password Lama"
                    rules={[
                      { required: true, message: "Password wajib diisi" },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password Baru"
                    rules={[
                      { required: true, message: "Password wajib diisi" },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </>
              )}
            </>
          )}

          {/* Saat tambah user, wajib isi password */}
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Password wajib diisi" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Row>
  );
}

export default User;
