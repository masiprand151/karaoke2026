import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import { formatRp } from "../utils/rupiah";
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Descriptions,
  Divider,
  Tag,
  Flex,
} from "antd";
import { useAlert } from "../contexts/AlertContext";
import { useConfirm } from "../contexts/ConfirmContext";

const { Title, Text } = Typography;

function Payment() {
  const { sessionId } = useParams();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const navigate = useNavigate();

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

  useEffect(() => {
    setAmount(data?.grandTotal);
  }, [data]);

  const handleSubmit = async (e) => {
    const ok = await showConfirm({
      description: `Anda ingin melakukan pembayaran sebesar: ${formatRp(amount)}?, dengan metode: ${method}`,
    });
    if (!ok) return;
    try {
      const transactionId = data?.transaction.id;
      const res = await api.post(`/session/payment/${transactionId}`, {
        method,
        amount,
      });

      showAlert({
        type: "success",
        message: "Pembayaran berhasil",
      });
      navigate(`/preview/${sessionId}`);
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 600,
        }}
      >
        <Flex align="center" justify="space-between">
          <Title level={3}>Payment</Title>
          <p
            style={{
              color: "#f61238",
            }}
          >
            Priksa ulang apakah jumlah/total sudah benar!
          </p>
        </Flex>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Customer">
            {data?.customerName}
          </Descriptions.Item>

          <Descriptions.Item label="Room">{data?.room?.name}</Descriptions.Item>

          <Descriptions.Item label="Duration">
            {data?.durationMinutes / 60} Jam
          </Descriptions.Item>

          <Descriptions.Item label="Room Amount">
            {formatRp(data?.amount)}
          </Descriptions.Item>

          <Descriptions.Item label="F&B">
            {formatRp(data?.fnbSubtotal)}
          </Descriptions.Item>

          <Descriptions.Item label="Lady">
            {formatRp(data?.ladyTotal)}
          </Descriptions.Item>

          <Descriptions.Item label="Tax">
            {formatRp(data?.taxAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="Service">
            {formatRp(data?.serviceAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="Discount">
            {formatRp(data?.roomDisAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            <Tag
              color={
                data?.transaction?.status === "paid"
                  ? "green"
                  : data?.transaction?.status === "partial"
                    ? "blue"
                    : "orange"
              }
            >
              {data?.transaction?.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* <Divider /> */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            Grand Total
          </Text>

          <Title
            level={4}
            style={{
              margin: 0,
              color: "#f61238",
            }}
          >
            {formatRp(data?.grandTotal)}
          </Title>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Payment Method">
            <Select value={method} onChange={setMethod}>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="transfer">Transfer</Select.Option>

              <Select.Option value="debit">Debit</Select.Option>

              <Select.Option value="credit">Credit</Select.Option>

              <Select.Option value="ewallet">E-Wallet</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Paid Amount">
            <Input
              value={formatRp(
                Number(amount) < data?.grandTotal ? data.grandTotal : amount,
              )}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            />
          </Form.Item>

          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              size="large"
              onClick={() => navigate(`/preview/${sessionId}`)}
            >
              Back
            </Button>

            <Button
              htmlType="submit"
              type="primary"
              size="large"
              disabled={data?.transaction?.status === "paid"}
            >
              {data?.transaction?.status === "paid" ? "Paid" : "Pay Now"}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

export default Payment;
