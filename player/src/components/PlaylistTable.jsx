import { useState, useRef, useEffect } from "react";
import { Table, Button, Flex } from "antd";
import { usePlaylist } from "../contexts/PlaylistContext";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  ToTopOutlined,
  UpOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";

export default function PlaylistTable() {
  const { playlist, setPlaylist, addSong, removeSong, clearPlaylist } =
    usePlaylist();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const rowRefs = useRef([]);

  // fungsi swap posisi
  const moveSong = (from, to) => {
    if (to < 1 || to >= playlist.length) return; // batas aman
    const newList = [...playlist];
    const [moved] = newList.splice(from, 1);
    newList.splice(to, 0, moved);
    setPlaylist(newList);
    setSelectedIndex(to);
  };

  // setiap kali activeIndex berubah, scroll ke baris itu
  useEffect(() => {
    if (rowRefs.current[selectedIndex]) {
      rowRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  return (
    <div style={{ height: "60%", background: "#111", marginBottom: 8 }}>
      <Table
        rowKey={"key"}
        dataSource={playlist.filter((_, index) => index !== 0)} // tetap simpan index 0, tapi tidak ditampilkan
        columns={[{ title: "Title", dataIndex: "name" }]}
        pagination={false}
        size="small"
        sticky
        scroll={{ y: 250 }}
        style={{ height: 300 }}
        onRow={(record, index) => ({
          onClick: () => setSelectedIndex(index + 1), // +1 karena index 0 disembunyikan
        })}
        rowClassName={(record, index) =>
          index + 1 === selectedIndex ? "active-row" : ""
        }
        components={{
          body: {
            row: (props) => {
              const { "data-row-key": key, ...rest } = props;
              const index = playlist.findIndex((s) => s.key === key);
              return (
                <tr {...rest} ref={(el) => (rowRefs.current[index] = el)} />
              );
            },
          },
        }}
      />

      <Flex justify="center" gap="middle" style={{ margin: 8 }}>
        <Button type="primary" onClick={clearPlaylist}>
          <CloseCircleOutlined />
        </Button>
        <Button
          type="primary"
          onClick={() => removeSong(playlist[selectedIndex].key)}
        >
          <DeleteOutlined />
        </Button>
        <Button type="primary">
          <ToTopOutlined />
        </Button>
        <Button
          type="primary"
          onClick={() => moveSong(selectedIndex, selectedIndex - 1)}
        >
          <UpOutlined />
        </Button>
        <Button
          type="primary"
          onClick={() => moveSong(selectedIndex, selectedIndex + 1)}
        >
          <DownOutlined />
        </Button>
      </Flex>
    </div>
  );
}
