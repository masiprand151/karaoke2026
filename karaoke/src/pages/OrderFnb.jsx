import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { Row, Col, Card, Table, Button, Input, Space } from "antd";

import { formatRp } from "../utils/rupiah";
const { Search } = Input;

function OrderFnb() {
  const { sessionId } = useParams();
  const [fnbs, setFnbs] = useState([]);
  const [selectedFnb, setSelectedFnb] = useState("");
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/fnb");
        setFnbs(res.fnbs);
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, []);
  const addToCart = (fnb) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === fnb.id);
      if (existing) {
        return prev.map((item) =>
          item.id === fnb.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...fnb, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmOrder = async (e) => {
    e.preventDefault();

    try {
      const res = await Promise.all(
        cart.map(async (item) => {
          return api.post("/fnb/order", {
            sessionId: Number(sessionId),
            fnbId: item.id,
            quantity: item.quantity,
          });
          return true;
        }),
      );
      alert("Yey! berhasil order");
      navigate(-1);
      setCart([]);
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <Row gutter={16} style={{ height: "100%" }}>
      {/* Product List */}
      <Col span={14}>
        <Card
          title="Product List"
          extra={
            <Search placeholder="Search Product..." allowClear enterButton />
          }
          style={{ height: "100%" }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 520 }}
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
                width: 90,
                align: "center",
              },
              {
                title: "Aksi",
                width: 110,
                align: "center",
                render: (_, row) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => addToCart(row)}
                  >
                    Tambah
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </Col>

      {/* Cart */}
      <Col span={10}>
        <Card
          title="Cart"
          style={{ height: "100%" }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: 0,
          }}
        >
          <Table
            sticky
            size="small"
            pagination={false}
            scroll={{ y: 430 }}
            rowKey="id"
            dataSource={cart}
            columns={[
              {
                title: "Nama",
                dataIndex: "name",
              },
              {
                title: "Qty",
                dataIndex: "quantity",
                width: 70,
                align: "center",
              },
              {
                title: "Subtotal",
                render: (_, row) => formatRp(row.basePrice * row.quantity),
              },
              {
                title: "Aksi",
                width: 90,
                align: "center",
                render: (_, row) => (
                  <Button
                    danger
                    size="small"
                    onClick={() => removeFromCart(row.id)}
                  >
                    Hapus
                  </Button>
                ),
              },
            ]}
          />

          <div
            style={{
              padding: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                disabled={cart.length <= 0}
                onClick={confirmOrder}
              >
                Confirm Order
              </Button>

              <Button block onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </Space>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
export default OrderFnb;
