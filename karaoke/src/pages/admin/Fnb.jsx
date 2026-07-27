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

const { Title } = Typography;
const { Search } = Input;

export default function Fnb() {
  const { fnbs, query, setQuery, getFnb } = useFnbs();
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
        showAlert({
          type: "success",
          message: "Berhasil update fnb",
        });
      } else {
        // create
        showAlert({
          type: "success",
          message: "Berhasil tambah fnb",
        });
      }
      setIsModalOpen(false);
      setEditingFnb(null);
      getFnb();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      showAlert({
        type: "success",
        message: "Berhasil delete fnb",
      });
      getFnb();
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
                title: "Harga",
                render: (_, row) => formatRp(row.basePrice),
              },
              {
                title: "Stock",
                dataIndex: "stock",

                align: "center",
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
                        console.log(row);
                      }}
                    >
                      Purcase
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openModal(row)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Yakin hapus user ini?"
                      onConfirm={() => handleDelete(row.id)}
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>
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
        title={editingFnb ? "Edit Fnb" : "Tambah Fnb"}
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
          <Form.Item name={"stock"} label="stock">
            <Input disabled />
          </Form.Item>

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
      />
    </Row>
  );
}
