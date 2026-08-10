import React, { useEffect, useState } from "react";
import { Tabs, Card, Table, Spin, Button, Space, DatePicker } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import dayjs from "dayjs";
import { formatRp } from "../../utils/rupiah";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function Report() {
  const [loading, setLoading] = useState(false);

  const [cancel, setCancel] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [roomTrans, setRoomTrans] = useState([]);

  // default hari ini
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const navigate = useNavigate();

  const fetchReports = async () => {
    if (!dateRange?.[0] || !dateRange?.[1]) {
      return;
    }

    setLoading(true);

    try {
      const start = dateRange[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss");

      const end = dateRange[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      const params = {
        start,
        end,
      };

      console.log("REPORT PARAMS:", params);

      const [cancelRes, purchaseRes, roomRes] = await Promise.all([
        api.get("/reports/cancel", { params }),
        api.get("/reports/purchase", { params }),
        api.get("/reports/room/detail", { params }),
      ]);

      console.log("REPORT CANCEL:", cancelRes);
      console.log("REPORT PURCHASE:", purchaseRes);
      console.log("REPORT ROOM:", roomRes);

      setCancel(Array.isArray(cancelRes) ? cancelRes : []);

      setPurchase(Array.isArray(purchaseRes) ? purchaseRes : []);

      setRoomTrans(Array.isArray(roomRes) ? roomRes : []);
    } catch (err) {
      setCancel([]);
      setPurchase([]);
      setRoomTrans([]);
    } finally {
      setLoading(false);
    }
  };

  // pertama kali buka → laporan hari ini
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      {/* HEADER */}
      <Space
        style={{
          width: "100%",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <RangePicker
          value={dateRange}
          format="DD/MM/YYYY"
          onChange={(values) => {
            setDateRange(values);
          }}
        />

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={fetchReports}
          disabled={!dateRange?.[0] || !dateRange?.[1]}
        >
          Tampilkan
        </Button>
      </Space>

      {loading ? (
        <div
          style={{
            height: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="room">
          {/* =========================================
              LAPORAN TRANSAKSI ROOM
          ========================================= */}
          <TabPane tab="Transaction Room" key="room">
            <Card title="Laporan Transaksi Room">
              <Table
                dataSource={roomTrans}
                rowKey="id"
                scroll={{
                  y: 500,
                }}
                size="small"
                pagination={false}
                columns={[
                  {
                    title: "Tanggal",
                    dataIndex: "createdAt",
                    width: 120,
                    render: (v) => dayjs(v).format("YYYY-MM-DD"),
                  },
                  {
                    title: "Inv",
                    dataIndex: "number",
                    width: 180,
                    ellipsis: true,
                  },
                  {
                    title: "Room",
                    dataIndex: ["room", "name"],
                    width: 120,
                    ellipsis: true,
                  },
                  {
                    title: "Diskon",
                    dataIndex: "discount",
                    width: 130,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "Subtotal Room",
                    dataIndex: "subtotal",
                    width: 150,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "F&B",
                    dataIndex: "fnbTotal",
                    width: 130,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "Pemandu",
                    dataIndex: "ladyTotal",
                    width: 130,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "Service",
                    dataIndex: "serviceAmount",
                    width: 130,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "Tax",
                    dataIndex: "taxAmount",
                    width: 130,
                    align: "right",
                    render: formatRp,
                  },
                  {
                    title: "Grand Total",
                    dataIndex: "grandTotal",
                    width: 160,
                    align: "right",
                    render: formatRp,
                  },
                ]}
                summary={() => {
                  const grandTotal = roomTrans.reduce(
                    (total, item) => total + Number(item.grandTotal || 0),
                    0,
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={9}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell index={9} align="right">
                        <strong>{formatRp(grandTotal)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          </TabPane>

          {/* =========================================
              LAPORAN PEMBATALAN
          ========================================= */}
          <TabPane tab="Void" key="cancel">
            <Card title="Log Pembatalan">
              <Table
                dataSource={cancel}
                rowKey="id"
                scroll={{
                  y: 500,
                  // x: 900,
                }}
                pagination={false}
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    width: 80,
                  },

                  {
                    title: "Type",
                    dataIndex: "type",
                  },

                  {
                    title: "Action",
                    dataIndex: "action",
                  },

                  {
                    title: "User",
                    dataIndex: ["user", "username"],
                    render: (value) => value || "-",
                  },

                  {
                    title: "Created At",
                    dataIndex: "createdAt",
                    render: (value) =>
                      value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-",
                  },
                ]}
              />
            </Card>
          </TabPane>

          {/* =========================================
              LAPORAN PEMBELIAN
          ========================================= */}
          <TabPane tab="Purchase" key="purchase">
            <Card title="Laporan Pembelian">
              <Table
                dataSource={purchase}
                rowKey="id"
                scroll={{
                  y: 500,
                  // x: 1000,
                }}
                pagination={false}
                columns={[
                  {
                    title: "Supplier",
                    dataIndex: "supplierName",
                    render: (value) => value || "-",
                  },

                  {
                    title: "Invoice",
                    dataIndex: "invoiceNumber",
                    render: (value) => value || "-",
                  },

                  {
                    title: "F&B",
                    dataIndex: ["fnb", "name"],
                    render: (value) => value || "-",
                  },

                  {
                    title: "Qty",
                    dataIndex: "quantity",
                    align: "center",
                    render: (value) => Number(value || 0),
                  },

                  {
                    title: "Total",
                    dataIndex: "totalAmount",
                    align: "right",
                    render: (value) => formatRp(Number(value || 0)),
                  },

                  {
                    title: "Created By",
                    dataIndex: ["createdBy", "username"],
                    render: (value) => value || "-",
                  },
                ]}
              />
            </Card>
          </TabPane>
        </Tabs>
      )}
    </div>
  );
}

export default Report;
