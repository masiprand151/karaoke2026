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
  Typography,
  Form,
  InputNumber,
} from "antd";
import {
  SwapOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { formatRp } from "../utils/rupiah";
import DiscountForm from "../components/DiscountForm";
import LadyCountdown from "../components/LadyCountdown";
import DetailsTable from "../components/DetailsTable";

const { Text } = Typography;

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
    <div
      style={{
        padding: 20,
      }}
    >
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
                <Text
                  ellipsis={{ tooltip: data?.customerName }}
                  style={{
                    width: 140,
                    display: "inline-block",
                    // fontSize: 14,
                    verticalAlign: "middle",
                  }}
                >
                  {data?.customerName}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Room">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {data?.room?.name}
                  <Button
                    type="text"
                    size="small"
                    icon={<SwapOutlined />}
                    onClick={() => setShowMvRoom(true)}
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Duration">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {data?.durationMinutes
                    ? `${data.durationMinutes / 60} Jam`
                    : "-"}
                  <Button size="small" icon={<EditOutlined />} />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Extend">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {(data?.extendMinutes ?? 0) / 60} Jam
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Extend");
                      }
                    }}
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Free Minute">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {data?.freeMinutes} Menit
                  <Button
                    size="small"
                    onClick={() => {
                      if (data.status !== "paid") {
                        setShowModal(true);
                        setModalType("Free Minute");
                      }
                    }}
                    icon={<EditOutlined />}
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Room Amount">
                {formatRp(data?.amount)}
              </Descriptions.Item>

              <Descriptions.Item label="Discount">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {formatRp(data?.roomDisAmount)}

                  <Button
                    size="small"
                    onClick={() => setShowDisRoom(true)}
                    icon={<EditOutlined />}
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="F&B">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {formatRp(data?.fnbSubtotal)}

                  <Button
                    type="primary"
                    size="small"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate(`/fnb/order/${sessionId}`)}
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Lady">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {formatRp(data?.ladyTotal)}
                  <Button
                    type="primary"
                    size="small"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate(`/lady/order/${sessionId}`)}
                  />
                </div>
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
                // color: "#1677ff",
                fontWeight: "bold",
              }}
            />

            <Flex justify="space-between" style={{ marginTop: 20 }}>
              <Button onClick={() => navigate("/")}>Back</Button>

              <Space>
                <Button color="default" variant="solid">
                  Solid
                </Button>
                <Button type="primary" onClick={() => {}}>
                  Print
                </Button>
                <Button
                  color="cyan"
                  variant="solid"
                  onClick={() => navigate(`/payment/${sessionId}`)}
                >
                  Payment
                </Button>

                <Button color="danger" variant="solid" onClick={handleCheckout}>
                  Checkout
                </Button>
              </Space>
            </Flex>
          </Card>
        </Col>

        <DetailsTable data={data} refresh={getPreview} />
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
          getPreview();
        }}
      />
    </div>
  );
}
