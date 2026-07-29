import {
  Row,
  Col,
  Card,
  Table,
  Typography,
  Input,
  Flex,
  Button,
  Modal,
  Tooltip,
  Skeleton,
  Popconfirm,
  Divider,
} from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import DriveTree from "../../components/DriveTree";
import { useAlert } from "../../contexts/AlertContext";
import { DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

export default function Songs() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [songs, setSongs] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const getSongs = async (query = "") => {
    try {
      if (!query) {
        setLoading(true);
      }

      const { songs } = await api.get(`/songs?search=${query}`);

      setSongs(songs);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getSongs(query);
    });
  }, [query]);

  // handler ketika folder dipilih di tree
  const handleSelect = async (keys) => {
    setLoading(true); // tampilkan spinner
    try {
      if (keys.length > 0) {
        const folderPath = keys[0];
        const res = await api.get(`/songs/scan?folderPath=${folderPath}`);
        setFiles(res.files);
        showAlert({
          type: "success",
          message: "Yey!",
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        messgae: error.messgae,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const res = await api.post("/songs/import", { songs: files });
      showAlert({
        type: "success",
        message: `Berhasil import ${res.count} lagu`,
      });
      getSongs();
    } catch (error) {
      showAlert({
        type: "error",
        messgae: error.messgae,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleDelete = async (row) => {
    try {
      setLoading(true);
      await api.delete(`/songs?id=${row.id}`);
      showAlert({
        type: "success",
        message: `Berhasil delete "${row.name}"`,
      });
      getSongs();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResset = async () => {
    try {
      setLoading(true);
      await api.delete(`/songs`);
      showAlert({
        type: "success",
        message: `Berhasil resset semua data lagu`,
      });
      getSongs();
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true, // otomatis kasih ...
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
  ];

  const songsColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true, // otomatis kasih ...
    },

    {
      title: "Artist",
      dataIndex: "artist",
      key: "artist",
      ellipsis: true, // otomatis kasih ...
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      ellipsis: true, // otomatis kasih ...
    },

    {
      title: "",
      key: "action",
      align: "center",
      render: (_, row) => {
        return (
          <Popconfirm
            title="Yakin hapus lagu ini?"
            onConfirm={() => handleDelete(row)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={loading}
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Row gutter={16}>
      <Col>
        <Card
          title="Scan Files"
          style={{ height: "100%" }}
          extra={
            <Flex gap={8} align="center">
              <Search
                placeholder="Search file..."
                allowClear
                enterButton
                style={{ width: 250 }}
                value={query}
                onChange={(e) => {
                  e.preventDefault();
                  setQuery(e.target.value);
                }}
              />
              <Button onClick={() => navigate(-1)}>Back</Button>
            </Flex>
          }
        >
          <Flex gap={"middle"}>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setOpen(true);
              }}
            >
              Fast Import
            </Button>
            <Popconfirm
              title="Yakin hapus semua data lagu?"
              onConfirm={handleResset}
            >
              <Button size="small" type="primary" danger>
                Resset
              </Button>
            </Popconfirm>
          </Flex>
          <Divider />
          <Table
            dataSource={songs}
            loading={loading}
            columns={songsColumns}
            rowKey="id"
            pagination={false}
            scroll={{ y: "60vh" }} // scroll vertikal
            sticky
            size="small"
          />

          {/* Modal untuk tabel */}
          <Modal
            title="Files in Folder"
            centered
            open={open}
            onCancel={() => {
              setOpen(false);
            }}
            width="80%"
            closable={false} // hilangkan tombol X
            maskClosable={false} // tidak bisa tutup dengan klik luar
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleImport}
                loading={loading}
              >
                Import
              </Button>,
            ]}
          >
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row" span={12}>
                <Card title="File Manager" style={{ height: "100%" }}>
                  <DriveTree
                    onSelect={handleSelect}
                    treeData={treeData}
                    setTreeData={setTreeData}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </Card>
              </Col>
              <Col className="gutter-row" span={12}>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 6 }} /> // tampilkan skeleton baris
                ) : (
                  <Table
                    dataSource={files.filter((f) =>
                      f.name.toLowerCase().includes(query.toLowerCase()),
                    )}
                    columns={columns}
                    rowKey="path"
                    pagination={false}
                    scroll={{ y: "60vh" }} // scroll vertikal
                    sticky
                  />
                )}
              </Col>
            </Row>
          </Modal>
        </Card>
      </Col>
    </Row>
  );
}
