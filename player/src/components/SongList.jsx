import { Col, Typography, Input, Table, Button } from "antd";
const { Title } = Typography;
import {
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import VirtualKeyboard from "./VirtualKeyboard";

function SongList({
  songs,
  loading,
  activeIndex,
  setActiveIndex,
  addSong,
  rowRefs,
  setQuery,
  query,
  hasMore,
  onLoadMore,
  isOffline,
}) {
  const [activeId, setActiveId] = useState(0);
  const inputRef = useRef(null);
  const tableRef = useRef(null);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const hasMoved = useRef(false);
  const selectedRowRef = useRef(null);

  useEffect(() => {
    setActiveId(songs[activeIndex]?.id);
  }, [songs, activeIndex]);

  useEffect(() => {
    const body = tableRef.current?.querySelector(".ant-table-body");

    if (!body) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = body;

      // Load berikutnya ketika tinggal 50px menuju bawah
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (!nearBottom) return;
      if (loading) return;
      if (!hasMore) return;

      onLoadMore?.();
    };

    body.addEventListener("scroll", handleScroll);

    return () => {
      body.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore, onLoadMore]);

  const thum = {
    title: "",
    width: 80,
    render: (_, row) => {
      if (!row.thumbnail) return null;

      return (
        <img
          src={row.thumbnail}
          alt={row.name}
          style={{
            width: 60,
            height: 40,
            objectFit: "cover",
            borderRadius: 4,
            display: "block",
          }}
        />
      );
    },
  };

  const columnsTitle = [
    ...(!isOffline ? [thum] : []),
    { title: "Title", ellipsis: true, dataIndex: "name" },
    { title: "Artist", ellipsis: true, dataIndex: "artist" },
    {
      title: "",
      width: 40,
      render: (_, row) => {
        if (activeId === undefined) return;
        return (
          activeId === row.id && (
            <Button
              type="primary"
              size="small"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                addSong(row);
              }}
            >
              <ArrowRightOutlined />
            </Button>
          )
        );
      },
    },
  ];

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const body = tableRef.current?.querySelector(".ant-table-body");

    if (!body) return;

    isDragging.current = true;
    hasMoved.current = false;

    startY.current = e.clientY;
    startScrollTop.current = body.scrollTop;

    // simpan row yang sedang ditekan
    const row = e.target.closest("tr[data-row-key]");

    if (row) {
      selectedRowRef.current = row.getAttribute("data-row-key");
    } else {
      selectedRowRef.current = null;
    }

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const body = tableRef.current?.querySelector(".ant-table-body");

    if (!body) return;

    const deltaY = e.clientY - startY.current;

    if (Math.abs(deltaY) > 5) {
      hasMoved.current = true;
    }

    body.scrollTop = startScrollTop.current - deltaY;
  };
  const handlePointerUp = (e) => {
    if (!isDragging.current) return;

    isDragging.current = false;

    // Kalau tidak drag = dianggap klik row
    if (!hasMoved.current && selectedRowRef.current !== null) {
      const rowId = selectedRowRef.current;

      const index = songs.findIndex(
        (song) => String(song.id) === String(rowId),
      );

      if (index !== -1) {
        setActiveIndex(index);
        setActiveId(songs[index].id);
      }
    }

    selectedRowRef.current = null;
    hasMoved.current = false;

    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <Col
      span={16}
      style={{
        padding: 10,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title level={5} style={{ color: "#00ffff" }}>
        Songs
      </Title>

      <Input.Search
        ref={inputRef}
        placeholder="Cari lagu..."
        style={{ marginBottom: 8 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div
        ref={tableRef}
        className="song-table-drag"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Table
          className="song-table"
          rowKey={"id"}
          loading={isOffline && loading ? false : loading}
          dataSource={songs}
          columns={columnsTitle}
          pagination={false}
          size="small"
          sticky
          scroll={{ y: 250 }}
          // loading={loading}
          rowClassName={(_, index) => {
            return index === activeIndex ? "active-row" : "";
          }}
          // onRow={(record, index) => ({
          //   onClick: () => {
          //     // habis drag jangan dianggap klik
          //     if (hasMoved.current) {
          //       hasMoved.current = false;
          //       return;
          //     }
          //     setActiveIndex(index);
          //     setActiveId(record.id);
          //   },
          // })}

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
      </div>
      <VirtualKeyboard value={query} onChange={setQuery} inputRef={inputRef} />
    </Col>
  );
}

export default SongList;
