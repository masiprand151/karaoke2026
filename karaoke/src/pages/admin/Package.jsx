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
  const [filteredTags, setFilteredTags] = useState([]);
  const [pricingFnb, setPricingFnb] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const fetchRooms = async () => {
    try {
      const res = await api.get("/room");
      setRooms(res.rooms);
    } catch (err) {
      showAlert({ type: "error", message: err.message });
    }
  };

  const getPackages = async (query = "") => {
    const res = await api.get(`/pricing/package?search=${query}`);
    // gabungkan berdasarkan nama
    const grouped = {};
    res.packages.forEach((pkg) => {
      if (!grouped[pkg.name]) {
        grouped[pkg.name] = {
          ...pkg,
          ids: [pkg.id],
          rooms: [pkg.roomId], // mulai dengan satu room
        };
      } else {
        // kalau nama sudah ada, tambahkan roomId ke array
        grouped[pkg.name].ids.push(pkg.id);
        grouped[pkg.name].rooms.push(pkg.roomId);
      }
    });

    // ubah object jadi array
    const uniquePackages = Object.values(grouped);

    setPackages(uniquePackages);
  };

  useEffect(() => {
    getPackages(query);
  }, [query]);

  const openModal = (pkg = null) => {
    setFilteredTags([]);
    setEditingPackage(pkg);
    fetchRooms();
    setIsModalOpen(true);
    if (pkg) {
      form.resetFields();
      setFilteredTags(pkg.rooms);
      form.setFieldsValue(pkg);
      form.setFieldsValue({
        ...pkg,
        fnbs: pkg.pricingFnbs?.map((f) => ({
          fnbId: f.fnbId,
          quantity: f.quantity,
        })),
      });
    } else {
      form.resetFields();
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingPackage) {
        // update
        // update package
        let selectedRooms = [];

        if (!values.rooms || values.rooms.length === 0) {
          // kalau tidak pilih room → auto semua room
          selectedRooms = rooms.map((room) => ({ roomId: room.id }));
        } else {
          // kalau pilih room → ambil dari values.rooms
          selectedRooms = values.rooms.map((v) => ({
            roomId: v,
          }));
        }
        const data = {
          ...values,
          isPackage: true,
          fnbs: values.fnbs?.map((f) => ({
            fnbId: f.fnbId,
            quantity: f.quantity,
          })),
        };

        // kirim ke backend untuk setiap room
        await Promise.all(
          selectedRooms.map(async (room) => {
            return api.put(`/pricing/${editingPackage.id}/package`, {
              ...data,
              roomId: room.roomId,
            });
          }),
        );

        showAlert({ type: "success", message: "Berhasil update package" });
      } else {
        // create
        let selectedRooms = [];

        if (!values.rooms || values.rooms.length === 0) {
          // kalau tidak pilih room → auto semua room
          selectedRooms = rooms.map((room) => ({ roomId: room.id }));
        } else {
          // kalau pilih room → ambil dari values.rooms
          selectedRooms = values.rooms.map((v) => ({
            roomId: v,
          }));
        }

        const data = {
          ...values,
          isPackage: true,
        };

        // kirim ke backend untuk setiap room
        await Promise.all(
          selectedRooms.map(async (room) => {
            return api.post("/pricing", { ...data, roomId: room.roomId });
          }),
        );

        showAlert({ type: "success", message: "Berhasil tambah package" });
      }

      setIsModalOpen(false);
      setEditingPackage(null);
      setFilteredTags([]);
      getPackages();
    } catch (error) {
      if (error.errorFields) {
        console.log("Validasi gagal:", error.errorFields);
      } else {
        showAlert({ type: "error", message: error.message });
      }
    }
  };

  const handleDelete = async (row) => {
    try {
      console.log(row);
      await Promise.all(
        row.ids.map((id) => api.delete(`/pricing/${id}/package`)),
      );

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
              {
                title: "Durasi",
                dataIndex: "durationMinutes",
              },
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
                    />

                    <Popconfirm
                      title="Yakin hapus package ini?"
                      onConfirm={() => handleDelete(row)}
                    >
                      <Button danger icon={<DeleteOutlined />} />
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
        onCancel={() => {
          setFilteredTags([]);
          setIsModalOpen(false);
        }}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name={"rooms"} label="Pilih Room">
            <Select
              mode="tags"
              style={{ width: "100%", maxHeight: 120 }}
              placeholder="Jika kosong maka auto all room"
              value={editingPackage ? filteredTags : []}
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
