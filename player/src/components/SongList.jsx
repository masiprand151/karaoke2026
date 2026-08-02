import { Col, Typography, Input, Table, Button } from "antd";
const { Title } = Typography;
import {
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

function SongList({
  songs,
  loading,
  activeIndex,
  setActiveIndex,
  addSong,
  rowRefs,
}) {
  const [activeId, setActiveId] = useState(0);

  useEffect(() => {
    setActiveId(songs[activeIndex]?.id);
  }, [songs]);

  const columnsTitle = [
    { title: "Title", dataIndex: "name" },
    { title: "Artist", dataIndex: "artist" },
    {
      title: "",
      align: "end",
      width: 40,
      render: (_, row) => {
        return (
          activeId === row.id && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                addSong(songs[activeIndex]);
              }}
            >
              <ArrowRightOutlined />
            </Button>
          )
        );
      },
    },
  ];

  return (
    <Col
      span={16}
      style={{
        padding: 18,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title level={5} style={{ color: "#00ffff" }}>
        Songs
      </Title>

      <Input placeholder="Cari lagu..." style={{ marginBottom: 8 }} />

      <Table
        className="song-table"
        rowKey={"id"}
        dataSource={songs}
        columns={columnsTitle}
        pagination={false}
        size="small"
        sticky
        scroll={{ y: 250 }}
        loading={loading}
        rowClassName={(_, index) => {
          return index === activeIndex ? "active-row" : "";
        }}
        onRow={(record, index) => {
          return {
            onClick: () => {
              setActiveIndex(index);
              setActiveId(record.id);
            },
          };
        }}
        // components={{
        //   body: {
        //     row: (props) => {
        //       const { "data-row-key": key, ...rest } = props;
        //       const index = songs.findIndex((s) => s.id === key);

        //       return (
        //         <tr {...rest} ref={(el) => (rowRefs.current[index] = el)} />
        //       );
        //     },
        //   },
        // }}
      />
      {/* 
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 40,
          gap: 8,
          position: "absolute",
          right: 0,
          top: "30%",
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          size="large"
          onClick={() => {
            addSong(songs[activeIndex]);
          }}
        >
          <ArrowRightOutlined />
        </Button>

        <Button
          type="primary"
          size="large"
          onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
        >
          <ArrowUpOutlined />
        </Button>

        <Button
          type="primary"
          size="large"
          onClick={() =>
            setActiveIndex((prev) => Math.min(prev + 1, songs.length - 1))
          }
        >
          <ArrowDownOutlined />
        </Button>
      </div> */}
    </Col>
  );
}

export default SongList;
