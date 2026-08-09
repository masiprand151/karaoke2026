import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Row, Col, Card, Table, Button, Input, Space } from "antd";
import { formatRp } from "../utils/rupiah";
import useFnbs from "../hooks/useFnbs";
import { useReactToPrint } from "react-to-print";
import { ReceiptFnb } from "../components/Receipt";
import { useAlert } from "../contexts/AlertContext";
const { Search } = Input;

function OrderFnb() {
  const { sessionId } = useParams();
  const location = useLocation();

  // data yang dikirim via navigate
  const { roomName, customerName } = location.state || {};
  const navigate = useNavigate();
  const componentRef = useRef();
  const { showAlert } = useAlert();

  const handlePrintFnb = async () => {
    const htmlContent = componentRef.current.outerHTML;
    const res = await window.electron.printReceipt({
      htmlContent,
      printerTarget: "kitchen",
    });
    showAlert({
      type: res.success ? "success" : "error",
      message: res.message,
    });
  };

  const {
    fnbs,
    query,
    error,
    loading,
    cart,
    setFnbs,
    setQuery,
    setError,
    setLoading,
    getFnbs,
    confirmOrder,
    addToCart,
    removeFromCart,
  } = useFnbs(sessionId, handlePrintFnb);

  return (
    <Row gutter={16} style={{ height: "100%" }}>
      {/* Product List */}
      <Col span={14}>
        <Card
          title="Product List"
          extra={
            <Search
              placeholder="Search Product..."
              allowClear
              enterButton
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
          {/* Komponen slip CO Bar tersembunyi */}
          <div style={{ display: "none" }}>
            <ReceiptFnb
              ref={componentRef}
              cart={cart}
              session={{ room: { name: roomName }, customerName: customerName }}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
export default OrderFnb;
