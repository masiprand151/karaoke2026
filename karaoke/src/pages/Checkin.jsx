import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
} from "antd";

import dayjs from "dayjs";
import { useAlert } from "../contexts/AlertContext";

const { Title } = Typography;

export default function Checkin() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const customerRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricingType, setPricingType] = useState("REGULAR");

  const [form, setForm] = useState({
    customerName: "",
    pricingId: "",
    durationMinutes: 60,
  });

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    try {
      const res = await api.get(`/room/${roomId}`);

      const roomData = res.room;

      setRoom(roomData);
      console.log(roomData);

      if (roomData.pricings.length > 0) {
        const pricing = roomData.pricings[0];

        setForm((prev) => ({
          ...prev,
          pricingId: pricing.id,
          durationMinutes: pricing.durationMinutes ?? 60,
        }));

        setPricingType(pricing.name.toUpperCase());
      }

      setTimeout(() => {
        customerRef.current?.focus();
      }, 200);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePricingChange = (pricingId) => {
    const pricing = room.pricings.find((p) => p.id === pricingId);

    setPricingType(pricing.name.toUpperCase());

    setForm((prev) => ({
      ...prev,
      pricingId,
      durationMinutes: pricing.durationMinutes ?? 60,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      await api.post("/session/checkin", {
        roomId: Number(roomId),
        pricingId: form.pricingId,
        durationMinutes: form.durationMinutes,
        customerName: form.customerName,
        userId: user.id,
      });

      showAlert({ type: "success", message: "Yey! check In berhasil" });

      navigate(-1);
    } catch (err) {
      showAlert({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ padding: 30 }}>
      <Col xs={24} sm={22} md={18} lg={14} xl={10}>
        <Card>
          <Title level={3} style={{ marginBottom: 25 }}>
            Check In - {room?.name}
          </Title>

          <Form onSubmitCapture={handleSubmit} layout="vertical">
            <Form.Item label="Package">
              <Select value={form.pricingId} onChange={handlePricingChange}>
                {room?.pricings.map((pricing) => (
                  <Select.Option key={pricing.id} value={pricing.id}>
                    {pricing.name.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Date">
              <DatePicker style={{ width: "100%" }} value={dayjs()} disabled />
            </Form.Item>

            <Form.Item label="Customer Name">
              <Input
                ref={customerRef}
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customerName: e.target.value.toUpperCase(),
                  }))
                }
              />
            </Form.Item>

            <Form.Item label="Duration (Hour)">
              <InputNumber
                min={1}
                max={12}
                style={{ width: "100%" }}
                disabled={pricingType !== "REGULAR"}
                value={form.durationMinutes / 60}
                onChange={(value) => {
                  const hour = Math.min(12, Math.max(1, Number(value || 1)));

                  setForm((prev) => ({
                    ...prev,
                    durationMinutes: hour * 60,
                  }));
                }}
              />
            </Form.Item>

            <Space
              style={{
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="primary" loading={loading} htmlType="submit">
                Check In
              </Button>
            </Space>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
