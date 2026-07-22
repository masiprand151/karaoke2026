import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useEffect, useState } from "react";
import MoveRoom from "../components/MoveRoom";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Divider,
  Descriptions,
  Flex,
  Modal,
  Form,
  InputNumber,
} from "antd";
import { formatRp } from "../utils/rupiah";
import DiscountForm from "../components/DiscountForm";
import LadyCountdown from "../components/LadyCountdown";
import DetailsTable from "../components/DetailsTable";

export default function Preview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [showMvRoom, setShowMvRoom] = useState(false);
  const [showDisRoom, setShowDisRoom] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [duration, setDuration] = useState(0);

  const getPreview = async () => {
    try {
      const res = await api.get(`/session/preview/${sessionId}`);

      setData(res);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getPreview();
  }, []);

  const handleCheckout = async () => {
    try {
      await api.post(`/session/checkout/${data?.id}`);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFreeMinute = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/session/free-minute", {
        sessionId: Number(sessionId),
        addMinutes: Number(duration),
      });
      alert("Berhail tambah free minute");
      getPreview();
      setDuration(0);
      setModalType(null);
      setShowModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/session/extend", {
        sessionId: Number(sessionId),
        addMinutes: Number(duration) * 60,
      });
      alert("Berhasil tambah jam");
      getPreview();
      setDuration(0);
      setModalType(null);
      setShowModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={10}>
          <Card
            title="Preview Billing"
            extra={
              <Tag
                color={
                  data?.status === "paid"
                    ? "green"
                    : data?.status === "partial"
                      ? "gold"
                      : "blue"
                }
              >
                {data?.status}
              </Tag>
            }
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Customer">
                {data?.customerName}
              </Descriptions.Item>

              <Descriptions.Item label="Room">
                <Space>
                  {data?.room?.name}

                  <Button size="small" onClick={() => setShowMvRoom(true)}>
                    Move
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Duration">
                <Space>
                  {data?.durationMinutes
                    ? `${data.durationMinutes / 60} Jam`
                    : "-"}
                  <Button size="small">Edit</Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Extend">
                <Space>
                  {(data?.extendMinutes ?? 0) / 60} Jam
                  <Button
                    size="small"
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Extend");
                      }
                    }}
                  >
                    Add
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Free Minute">
                <Space>
                  {data?.freeMinutes} Menit
                  <Button
                    size="small"
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Free Minute");
                      }
                    }}
                  >
                    Add
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Room Amount">
                {formatRp(data?.amount)}
              </Descriptions.Item>

              <Descriptions.Item label="Discount">
                <Space>
                  {formatRp(data?.roomDisAmount)}

                  <Button size="small" onClick={() => setShowDisRoom(true)}>
                    Edit
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="F&B">
                <Space>
                  {formatRp(data?.fnbSubtotal)}

                  <Button
                    size="small"
                    type="primary"
                    onClick={() => navigate(`/fnb/order/${sessionId}`)}
                  >
                    Order
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Lady">
                <Space>
                  {formatRp(data?.ladyTotal)}

                  <Button
                    size="small"
                    type="primary"
                    onClick={() => navigate(`/lady/order/${sessionId}`)}
                  >
                    Order
                  </Button>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Tax">
                {formatRp(data?.taxAmount)}
              </Descriptions.Item>

              <Descriptions.Item label="Service">
                {formatRp(data?.serviceAmount)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Statistic
              title="Grand Total"
              value={Number(data?.grandTotal)}
              precision={0}
              formatter={(v) => formatRp(v)}
              valueStyle={{
                color: "#1677ff",
                fontWeight: "bold",
              }}
            />

            <Flex justify="space-between" style={{ marginTop: 20 }}>
              <Button onClick={() => navigate("/")}>Back</Button>

              <Space>
                <Button
                  type="primary"
                  onClick={() => navigate(`/payment/${sessionId}`)}
                >
                  Payment
                </Button>

                <Button danger onClick={handleCheckout}>
                  Checkout
                </Button>
              </Space>
            </Flex>
          </Card>
        </Col>

        <DetailsTable data={data} />
      </Row>

      <Modal
        open={showModal}
        title={modalType}
        centered
        destroyOnHidden
        maskClosable={false}
        onCancel={() => {
          setModalType(null);
          setShowModal(false);
          setDuration(0);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalType(null);
              setShowModal(false);
              setDuration(0);
            }}
          >
            Cancel
          </Button>,

          <Button
            key="submit"
            type="primary"
            onClick={
              modalType === "Free Minute" ? handleFreeMinute : handleExtend
            }
          >
            Submit
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label={
              modalType === "Extend" ? "Extend (Jam)" : "Free Minute (Menit)"
            }
          >
            <InputNumber
              style={{ width: "100%" }}
              value={duration}
              min={0}
              max={modalType === "Extend" ? 9 : 30}
              onChange={(value) => {
                const v = Number(value || 0);

                if (modalType === "Extend") {
                  if (v >= 9) {
                    setDuration(9);
                  } else if (v <= 0) {
                    setDuration(0);
                  } else {
                    setDuration(v);
                  }
                } else {
                  if (v >= 30) {
                    setDuration(30);
                  } else if (v <= 0) {
                    setDuration(0);
                  } else {
                    setDuration(v);
                  }
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <MoveRoom
        open={showMvRoom}
        onClose={() => setShowMvRoom(false)}
        sessionId={data?.id}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      <DiscountForm
        transactionId={data?.transaction?.id}
        open={showDisRoom}
        onClose={() => {
          setShowDisRoom(false);
        }}
      />
    </>
  );
}
