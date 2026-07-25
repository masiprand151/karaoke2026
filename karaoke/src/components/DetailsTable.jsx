import { useState } from "react";
import { formatRp } from "../utils/rupiah";
import LadyCountdown from "./LadyCountdown";
import { Row, Col, Card, Button, Table, Flex } from "antd";
import EditFnbModal from "./EditFnbModal";
import api from "../utils/api";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Space } from "antd";
import EditLadyModal from "./EditLadyModal";
import { useAlert } from "../contexts/AlertContext";
import { useConfirm } from "../contexts/ConfirmContext";

function DetailsTable({ data, refresh }) {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [showFnbEdit, setShowFnbEdit] = useState(false);
  const [showLadyEdit, setShowLadyEdit] = useState(false);
  const [selectFnb, setSelectFnb] = useState(null);
  const [selectLady, setSelectLady] = useState(null);

  const handleEditFnb = async (updated) => {
    try {
      const res = await api.put(`/fnb/order/${updated.id}`, {
        quantity: Number(updated?.quantity),
      });
      showAlert({
        type: "success",
        message: `Berhasil update order f&b ${updated.fnb.name}`,
      });
      refresh();
    } catch (err) {
      showAlert({
        type: "success",
        message: err.message,
      });
    }
  };

  const handleEditLady = async (updated) => {
    try {
      const res = await api.put(`/lady/order/${updated.id}`, {
        quantity: Number(updated?.quantity),
      });
      showAlert({
        type: "success",
        message: `Berhasil update order lady ${updated.lady.name}`,
      });
      refresh();
    } catch (err) {
      showAlert({
        type: "success",
        message: err.message,
      });
    }
  };

  const handleVoidFnb = async (row) => {
    const ok = await showConfirm({
      description: `Apa anda yakin ingin melakukan void "${row.fnb.name}"?`,
    });

    if (!ok) return;
    try {
      const res = await api.delete(`/fnb/order/${row.id}`);
      showAlert({
        type: "success",
        message: `Berhasil void order f&b ${row.fnb.name}`,
      });
      refresh();
    } catch (err) {
      showAlert({
        type: "success",
        message: err.message,
      });
    }
  };

  const handleStopLady = async (row) => {
    const ok = await showConfirm({
      description: `Apa anda yakin ingin melakukan stop "${row.lady.name}"?`,
    });

    if (!ok) return;
    try {
      const res = await api.delete(`/lady/order/${row.id}`);
      showAlert({
        type: "success",
        message: `Berhasil stop order lady ${row.lady.name}`,
      });
      refresh();
    } catch (err) {
      showAlert({
        type: "success",
        message: err.message,
      });
    }
  };

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
          <Button size="small" danger onClick={() => handleVoidFnb(r)}>
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
          <Button
            size="small"
            onClick={() => {
              setSelectLady(r);
              setShowLadyEdit(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button size="small" danger onClick={() => handleStopLady(r)}>
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

      <EditLadyModal
        open={showLadyEdit}
        onClose={() => setShowLadyEdit(false)}
        lady={selectLady}
        onSave={handleEditLady}
      />
    </>
  );
}

export default DetailsTable;
