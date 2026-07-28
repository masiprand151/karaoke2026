import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useAlert } from "../../contexts/AlertContext";
import api from "../../utils/api";
import useFnbs from "../../hooks/useFnbs";
import useLadies from "../../hooks/useLadies";
import InputNumberic from "../../components/InputNumberic";
import InputPrice from "../../components/InputPrice";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function Package() {
  const { fnbs } = useFnbs();
  const { ladies } = useLadies();
  const [rooms, setRooms] = useState([]);

  const [packages, setPackages] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    getPackages();
  }, [query]);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/room");
      setRooms(res.rooms);
    } catch (err) {
      showAlert({ type: "error", message: err.message });
    }
  };

  const getPackages = async () => {
    const res = await api.get("/pricing/package", {
      params: { search: query },
    });
    setPackages(res.data);
  };

  const openModal = (pkg = null) => {
    setEditingPackage(pkg);
    fetchRooms();
    setIsModalOpen(true);
    if (pkg) {
      form.resetFields();
      form.setFieldsValue(pkg);
    } else {
      form.resetFields();
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPackage) {
        await api.put(`/pricing/${editingPackage.id}`, values);
        showAlert({ type: "success", message: "Berhasil update package" });
      } else {
        let selectedRooms = [];
        if (!values.rooms) {
          selectedRooms = rooms.map((room) => ({ roomId: room.id }));
        } else {
          selectedRooms = valuea.rooms.map((v) => ({
            roomId: v,
          }));
        }
        const data = {
          ...values,
          rooms: selectedRooms,
          isPackage: true,
        };

        console.log(data);

        // await api.post("/pricing", value);
        showAlert({ type: "success", message: "Berhasil tambah package" });
      }
      setIsModalOpen(false);
      setEditingPackage(null);
      getPackages();
    } catch (error) {
      if (error.errorFields) {
        console.log(error);
      } else {
        showAlert({ type: "error", message: error.message });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pricing/${id}`);
      showAlert({ type: "success", message: "Berhasil delete package" });
      getPackages();
    } catch (error) {
      showAlert({ type: "error", message: error.message });
    }
  };

  return (
    <Row gutter={16} style={{ height: "100vh" }}>
      <Col span={24}>
        <Card
          title="Package Management"
          extra={
            <Flex gap={8} align="center">
              <Search
                placeholder="Search Package..."
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
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            Tambah Package
          </Button>
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 550 }}
            rowKey="id"
            dataSource={packages}
            columns={[
              { title: "Nama Paket", dataIndex: "name" },
              { title: "Durasi", dataIndex: "durationMinutes" },
              { title: "Harga", dataIndex: "baseRate" },
              {
                title: "Promo",
                render: (_, row) =>
                  row.isPromo ? (
                    <Tag color="green">Promo</Tag>
                  ) : (
                    <Tag>Normal</Tag>
                  ),
              },
              {
                title: "Package",
                render: (_, row) =>
                  row.isPackage ? (
                    <Tag color="blue">Package</Tag>
                  ) : (
                    <Tag>Reguler</Tag>
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
                      title="Yakin hapus package ini?"
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
        title={editingPackage ? "Edit Package" : "Tambah Package"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name={"rooms"} label="Pilih Room">
            <Select
              mode="tags"
              style={{ width: "100%", maxHeight: 120 }}
              placeholder="Jika kosong maka auto all room"
            >
              {rooms &&
                rooms.map((room) => (
                  <Option value={room.id} key={room.name + room.id}>
                    {room.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Nama Paket"
            rules={[{ required: true, message: "Nama wajib di isi" }]}
          >
            <Input required />
          </Form.Item>
          <Flex
            justify="space-between"
            gap={8}
            style={{ marginBottom: 5 }}
            align="baseline"
          >
            <Form.Item
              name="baseRate"
              label="Harga"
              rules={[{ required: true, message: "Harga wajib di isi" }]}
            >
              <InputPrice min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="taxRate" label="Tax" initialValue={0}>
              <InputNumberic min={0} style={{ width: "100%" }} value={0} />
            </Form.Item>
            <Form.Item name="serviceCharge" label="Service" initialValue={0}>
              <InputNumberic min={0} style={{ width: "100%" }} value={0} />
            </Form.Item>
          </Flex>
          <Form.Item
            name="durationMinutes"
            label="Durasi (menit)"
            rules={[{ required: true, message: "Durasi wajib di isi" }]}
          >
            <InputNumberic min={30} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="ladyQty" label="Bandle Lady (quantity)">
            <InputNumberic min={30} style={{ width: "100%" }} />
          </Form.Item>

          {/* FnB bundle */}
          <Form.List name="fnbs">
            {(fields, { add, remove }) => (
              <Flex vertical>
                <label style={{ paddingBottom: 8 }}>FnB Bundle</label>
                <div
                  style={{
                    maxHeight: 130,
                    overflowY: "auto",
                  }}
                >
                  {fields.map(({ key, name, ...restField }) => (
                    <Flex
                      justify="space-between"
                      key={key}
                      gap={8}
                      style={{ marginBottom: 5 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "fnbId"]}
                        rules={[{ required: true, message: "Pilih FnB" }]}
                        style={{
                          width: "100%",
                        }}
                      >
                        <Select placeholder="Pilih FnB">
                          {fnbs &&
                            fnbs.map((fnb) => (
                              <Option key={fnb.name + fnb.id} value={fnb.id}>
                                {fnb.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: "Isi jumlah" }]}
                      >
                        <InputNumber min={1} />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Hapus
                      </Button>
                    </Flex>
                  ))}
                </div>
                <Button
                  type="dashed"
                  onClick={() => add({ fnbId: null, quantity: 1 })}
                  block
                >
                  Tambah FnB
                </Button>
              </Flex>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Row>
  );
}
