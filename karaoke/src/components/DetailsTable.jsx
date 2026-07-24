import { useState } from "react";
import { formatRp } from "../utils/rupiah";
import LadyCountdown from "./LadyCountdown";
import { Row, Col, Card, Button, Table } from "antd";
import EditFnbModal from "./EditFnbModal";
import api from "../utils/api";

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
      title: "Aksi",
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => {
            setSelectFnb(r);
            setShowFnbEdit(true);
          }}
        >
          Edit
        </Button>
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
      title: "Aksi",
      render: () => <Button size="small">Edit</Button>,
    },
  ];

  return (
    <>
      <Col span={14}>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Card title="Food & Beverage">
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
          </Col>

          <Col span={24}>
            <Card title="Lady Companion">
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
          </Col>
        </Row>
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
