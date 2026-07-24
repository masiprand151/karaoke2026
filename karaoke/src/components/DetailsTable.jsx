import { useState } from "react";
import { formatRp } from "../utils/rupiah";
import LadyCountdown from "./LadyCountdown";
import { Row, Col, Card, Button, Table, Flex } from "antd";
import EditFnbModal from "./EditFnbModal";
import api from "../utils/api";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Space } from "antd";

function DetailsTable({ data, refresh }) {
  const [showFnbEdit, setShowFnbEdit] = useState(false);
  const [showLadyEdit, setShowLadyEdit] = useState(false);
  const [selectFnb, setSelectFnb] = useState(null);
  const [selectLady, setSelectLady] = useState(null);

  const handleEditFnb = async (updated) => {
    try {
      const res = await api.put(`/fnb/order/${updated.id}`, {
        quantity: Number(updated?.quantity),
      });
      alert("Berhasil update");
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditLady = (updated) => {};

  const fnbColumns = [
    {
      title: "Nama",
      dataIndex: ["fnb", "name"],
    },
    {
      title: "Qty",
      dataIndex: "quantity",
    },
    {
      title: "Harga",
      render: (_, r) => formatRp(r.unitPrice),
    },
    {
      title: "Total",
      render: (_, r) => formatRp(r.totalAmount),
    },
    {
      title: "",
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setSelectFnb(r);
              setShowFnbEdit(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button size="small" danger>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const ladyColumns = [
    {
      title: "Lady",
      dataIndex: ["lady", "name"],
    },
    {
      title: "Qty",
      dataIndex: "quantity",
    },
    {
      title: "Harga",
      render: (_, r) => formatRp(r.unitPrice),
    },
    {
      title: "Total",
      render: (_, r) => formatRp(r.totalAmount),
    },
    {
      title: "Time",
      render: (_, r) => (
        <LadyCountdown
          ladyId={r.lady?.id}
          start={r.start}
          end={r.end}
          isJob={r.lady?.isJob}
        />
      ),
    },
    {
      title: "",
      render: (_, r) => (
        <Space>
          <Button size="small">
            <EditOutlined />
          </Button>
          <Button size="small" danger>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Col span={14}>
        <Flex gap={"middle"} vertical style={{ height: "100%" }}>
          <Card title="Food & Beverage" style={{ height: "100%" }}>
            <Table
              sticky
              size="small"
              pagination={false}
              scroll={{ y: 220 }}
              columns={fnbColumns}
              dataSource={data?.sessionFnbs}
              rowKey="id"
            />
          </Card>

          <Card title="Lady Companion" style={{ height: "100%" }}>
            <Table
              sticky
              size="small"
              pagination={false}
              scroll={{ y: 220 }}
              columns={ladyColumns}
              dataSource={data?.sessionLadies}
              rowKey="id"
            />
          </Card>
        </Flex>
      </Col>

      <EditFnbModal
        open={showFnbEdit}
        onClose={() => setShowFnbEdit(false)}
        fnb={selectFnb}
        onSave={handleEditFnb}
      />
    </>
  );
}

export default DetailsTable;
