import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Space,
  Input,
  Typography,
  InputNumber,
  Flex,
} from "antd";
import { formatRp } from "../utils/rupiah";

const { Title } = Typography;
const { Search } = Input;

function OrderLady() {
  const { sessionId } = useParams();
  const [ladies, setLadies] = useState([]);
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState({});
  const navigate = useNavigate();

  const fetchLady = async (query) => {
    try {
      const res = await api.get(`/lady?search=${query}`);
      setLadies(res.ladies);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchLady(query);
  }, [query]);

  const handleMin = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity <= 1 ? 1 : prev.quantity - 1,
      };
    });
  };

  const handlePlus = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity >= 10 ? 10 : prev.quantity + 1,
      };
    });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/lady/order", {
        sessionId,
        ladyId: selected.id,
        quantity: selected.quantity,
      });

      alert(`Berhasil order lady ${selected.name}`);
      setShow(false);
      setSelected({});
      fetchLady();
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="Lady Companion"
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
                      <Button danger size="small" disabled>
                        Sedang Kerja
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          setSelected({
                            ...row,
                            quantity: 1,
                          });
                          setShow(true);
                        }}
                      >
                        Tambah
                      </Button>
                    ),
                },
              ]}
            />
          </Card>
        </Col>

        <Modal
          open={show}
          title={`${selected?.name ?? ""} Duration (Jam)`}
          centered
          destroyOnHidden
          onCancel={() => {
            setSelected({});
            setShow(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setSelected({});
                setShow(false);
              }}
            >
              Cancel
            </Button>,

            <Button key="submit" type="primary" onClick={handleOrder}>
              Submit
            </Button>,
          ]}
        >
          <Space
            direction="vertical"
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Title level={5}>Durasi</Title>

            <Space>
              <Button onClick={handleMin}>-</Button>

              <InputNumber
                min={1}
                max={24}
                controls={false}
                value={selected?.quantity}
                readOnly
                style={{
                  width: 80,
                  textAlign: "center",
                }}
              />

              <Button onClick={handlePlus}>+</Button>
            </Space>
          </Space>
        </Modal>
      </Row>
    </>
  );
}

export default OrderLady;
