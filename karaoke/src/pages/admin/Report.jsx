import React, { useEffect, useState } from "react";
import { Tabs, Card, Table, Spin, Button, Space, DatePicker } from "antd";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import dayjs from "dayjs";
import { formatRp } from "../../utils/rupiah";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function Report() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("room");
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

      const [cancelRes, purchaseRes, roomRes] = await Promise.all([
        api.get(`/reports/cancel?start=${start}&end=${end}`),
        api.get(`/reports/purchase?start=${start}&end=${end}`),
        api.get(`/reports/room/detail?start=${start}&end=${end}`),
      ]);

      console.log(cancelRes);

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

  const exportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const start = dateRange?.[0] ? dateRange[0].format("DD/MM/YYYY") : "-";

    const end = dateRange?.[1] ? dateRange[1].format("DD/MM/YYYY") : "-";

    let title = "";
    let head = [];
    let body = [];
    let foot = [];

    // =========================================
    // ROOM
    // =========================================

    if (activeTab === "room") {
      title = "LAPORAN TRANSAKSI ROOM";

      head = [
        [
          "Tanggal",
          "Invoice",
          "Room",
          "Diskon",
          "Subtotal Room",
          "F&B",
          "Pemandu",
          "Service",
          "Tax",
          "Grand Total",
        ],
      ];

      body = roomTrans.map((item) => [
        dayjs(item.createdAt).format("DD-MM-YYYY"),
        item.number || "-",
        item.room?.name || "-",
        formatRp(Number(item.discount || 0)),
        formatRp(Number(item.subtotal || 0)),
        formatRp(Number(item.fnbTotal || 0)),
        formatRp(Number(item.ladyTotal || 0)),
        formatRp(Number(item.serviceAmount || 0)),
        formatRp(Number(item.taxAmount || 0)),
        formatRp(Number(item.grandTotal || 0)),
      ]);

      const total = roomTrans.reduce(
        (acc, item) => {
          acc.discount += Number(item.discount || 0);
          acc.subtotal += Number(item.subtotal || 0);
          acc.fnb += Number(item.fnbTotal || 0);
          acc.lady += Number(item.ladyTotal || 0);
          acc.service += Number(item.serviceAmount || 0);
          acc.tax += Number(item.taxAmount || 0);
          acc.grandTotal += Number(item.grandTotal || 0);

          return acc;
        },
        {
          discount: 0,
          subtotal: 0,
          fnb: 0,
          lady: 0,
          service: 0,
          tax: 0,
          grandTotal: 0,
        },
      );

      foot = [
        [
          {
            content: "TOTAL",
            colSpan: 3,
            styles: {
              halign: "left",
              fontStyle: "bold",
            },
          },
          formatRp(total.discount),
          formatRp(total.subtotal),
          formatRp(total.fnb),
          formatRp(total.lady),
          formatRp(total.service),
          formatRp(total.tax),
          formatRp(total.grandTotal),
        ],
      ];
    }

    // =========================================
    // VOID
    // =========================================

    if (activeTab === "cancel") {
      title = "LAPORAN VOID / PEMBATALAN";

      head = [
        ["Tanggal", "Room", "Customer", "F&B", "Qty", "Harga", "Total", "User"],
      ];

      body = cancel.map((item) => [
        dayjs(item.createdAt).format("DD-MM-YYYY HH:mm"),
        item.session?.room?.name || "-",
        item.session?.customerName || "-",
        item.fnb?.name || "-",
        Number(item.oldValue?.quantity || 0),
        formatRp(Number(item.oldValue?.unitPrice || 0)),
        formatRp(Number(item.oldValue?.totalAmount || 0)),
        item.user?.username || "-",
      ]);

      const total = cancel.reduce(
        (sum, item) => sum + Number(item?.oldValue?.totalAmount || 0),
        0,
      );

      foot = [
        [
          {
            content: "TOTAL VOID",
            colSpan: 6,
            styles: {
              halign: "left",
              fontStyle: "bold",
            },
          },
          {
            content: formatRp(total),
            styles: {
              // halign: "right",
              fontStyle: "bold",
            },
          },
          "",
        ],
      ];
    }

    // =========================================
    // PURCHASE
    // =========================================

    if (activeTab === "purchase") {
      title = "LAPORAN PEMBELIAN";

      head = [["Supplier", "Invoice", "F&B", "Qty", "Total", "Created By"]];

      body = purchase.map((item) => [
        item.supplierName || "-",
        item.invoiceNumber || "-",
        item.fnb?.name || "-",
        Number(item.quantity || 0),
        formatRp(Number(item.totalAmount || 0)),
        item.createdBy?.username || "-",
      ]);

      const total = purchase.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0,
      );

      foot = [
        [
          {
            content: "TOTAL PEMBELIAN",
            colSpan: 4,
            styles: {
              halign: "left",
              fontStyle: "bold",
            },
          },
          {
            content: formatRp(total),
            styles: {
              halign: "right",
              fontStyle: "bold",
            },
          },
          "",
        ],
      ];
    }

    // =========================================
    // HEADER PDF
    // =========================================

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Periode: ${start} - ${end}`, 14, 22);

    doc.text(`Dicetak: ${dayjs().format("DD-MM-YYYY HH:mm:ss")}`, 14, 28);

    // =========================================
    // TABLE
    // =========================================

    autoTable(doc, {
      startY: 34,

      head,

      body,

      foot,

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 2,
      },

      headStyles: {
        fontStyle: "bold",
        halign: "center",
      },

      footStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: "auto",
        },
      },
    });

    // =========================================
    // SAVE
    // =========================================

    const filename =
      `${title.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}` +
      `-${dateRange[0].format("YYYYMMDD")}` +
      `-${dateRange[1].format("YYYYMMDD")}.pdf`;

    doc.save(filename);
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

        <Button
          type="primary"
          danger
          icon={<FilePdfOutlined />}
          onClick={exportPdf}
          disabled={loading}
        >
          Export PDF
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
        <Tabs
          // defaultActiveKey="room"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
        >
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
                    render: (v) => dayjs(v).format("DD-MM-YYYY"),
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
                }}
                size="small"
                pagination={false}
                columns={[
                  {
                    title: "Tanggal",
                    dataIndex: "createdAt",
                    width: 150,
                    render: (v) => dayjs(v).format("DD-MM-YYYY"),
                  },

                  {
                    title: "Room",
                    dataIndex: ["session", "room", "name"],
                    width: 100,
                    render: (value, record) =>
                      value || record?.session?.room?.name || "-",
                  },

                  {
                    title: "Customer",
                    dataIndex: ["session", "customerName"],
                    width: 150,
                    ellipsis: true,
                    render: (value) => value || "-",
                  },

                  {
                    title: "F&B",
                    dataIndex: ["fnb", "name"],
                    width: 180,
                    ellipsis: true,
                    render: (value) => value || "-",
                  },

                  {
                    title: "Old",
                    dataIndex: ["oldValue", "quantity"],
                    width: 70,
                    align: "center",
                    render: (value) => Number(value || 0),
                  },
                  {
                    title: "New",
                    dataIndex: ["newValue", "quantity"],
                    width: 70,
                    align: "center",
                    render: (value) => Number(value || 0),
                  },

                  {
                    title: "Harga",
                    dataIndex: ["oldValue", "unitPrice"],
                    width: 120,
                    align: "right",
                    render: (value) => formatRp(Number(value || 0)),
                  },

                  {
                    title: "Total",
                    dataIndex: ["oldValue", "totalAmount"],
                    width: 130,
                    align: "right",
                    render: (value) => (
                      <strong>{formatRp(Number(value || 0))}</strong>
                    ),
                  },

                  {
                    title: "User",
                    dataIndex: ["user", "username"],
                    width: 130,
                    ellipsis: true,
                    render: (value) => value || "-",
                  },
                ]}
                summary={() => {
                  const total = cancel.reduce(
                    (sum, item) =>
                      sum + Number(item?.oldValue?.totalAmount || 0),
                    0,
                  );

                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6}>
                        <strong>TOTAL VOID</strong>
                      </Table.Summary.Cell>

                      <Table.Summary.Cell index={7} />
                      <Table.Summary.Cell index={8} align="right">
                        <strong>{formatRp(total)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
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
