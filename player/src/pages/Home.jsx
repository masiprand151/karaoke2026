import { Row, Col, Button, Input, Typography, Table, Slider, Flex } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import Spiner from "../components/Spiner";
import api from "../utils/api";
import { usePlaylist } from "../contexts/PlaylistContext";
import PlaylistTable from "../components/PlaylistTable";
import useSongs from "../hooks/useSongs";

const { Title } = Typography;

function Home() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { playlist, addSong, removeSong } = usePlaylist();

  const rowRefs = useRef([]);

  const getSongs = async (q = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/songs?search=${query}`);

      setSongs(res.songs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // setiap kali activeIndex berubah, scroll ke baris itu
  useEffect(() => {
    if (rowRefs.current[activeIndex]) {
      rowRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  const columnsTitle = [
    { title: "Title", dataIndex: "name" },
    { title: "Artist", dataIndex: "artist" },
  ];

  useEffect(() => {
    getSongs(query);
  }, [query]);

  return (
    <Row style={{ height: "100vh" }}>
      <Col
        span={12}
        style={{
          background: "radial-gradient(circle, #001529, #000)",
        }}
      >
        {/* Header kategori */}
        <Row justify="center" style={{ padding: "8px 0", background: "#111" }}>
          {[
            "ALL",
            "INDO",
            "DANGDUT",
            "DAERAH",
            "ANAK",
            "BARAT",
            "MANDARIN",
            "JEPANG",
            "KOREA",
            "HOUSE",
            "OTHERS",
          ].map((cat) => (
            <Button
              key={cat}
              style={{
                margin: "0 4px",
                background: "#400",
                color: "#fff",
                border: "1px solid #f00",
              }}
            >
              {cat}
            </Button>
          ))}
        </Row>

        {/* Konten utama */}
        <Row
          gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
          style={{ height: "80%" }}
        >
          {/* Kolom kiri: judul lagu */}
          <Col
            span={16}
            style={{
              padding: 18,
              height: "100%", // penuh tinggi parent Row
              display: "flex",
              flexDirection: "column", // biar Table bisa stretch
            }}
          >
            <Title level={5} style={{ color: "#00ffff" }}>
              Songs
            </Title>
            <Input placeholder="Cari lagu..." style={{ marginBottom: 8 }} />

            <Table
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
                  },
                };
              }}
              components={{
                body: {
                  row: (props) => {
                    const { "data-row-key": key, ...rest } = props;
                    const index = songs.findIndex((s) => s.id === key);
                    return (
                      <tr
                        {...rest}
                        ref={(el) => (rowRefs.current[index] = el)}
                      />
                    );
                  },
                },
              }}
            />
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
            </div>
          </Col>

          {/* Kolom kanan: playlist + video */}
          <Col span={7} style={{ padding: 8 }}>
            <Title level={5} style={{ color: "#00ffff" }}>
              PLAYLIST
            </Title>
            <PlaylistTable />

            <div style={{ color: "#fff", marginBottom: 16 }}>
              Sekarang: {playlist[0]?.name}
            </div>

            {/* Kontrol tambahan */}
            <div style={{ background: "#222", padding: 12, borderRadius: 8 }}>
              <Title level={5} style={{ color: "#ff0" }}>
                Volume
              </Title>
              <Slider defaultValue={50} tooltip={{ open: true }} />

              <Title level={5} style={{ color: "#ff0" }}>
                Pitch
              </Title>
              <Slider
                defaultValue={0}
                min={-5}
                max={5}
                tooltip={{ open: true }}
              />
            </div>
          </Col>
        </Row>

        {/* Kontrol bawah */}
        <Row
          justify="center"
          align="middle"
          style={{ height: "10%", background: "#000" }}
        >
          <Button
            icon={<PlayCircleOutlined />}
            type="primary"
            style={{ margin: "0 4px" }}
          >
            PLAY
          </Button>
          <Button icon={<PauseCircleOutlined />} style={{ margin: "0 4px" }}>
            PAUSE
          </Button>
          <Button icon={<StopOutlined />} danger style={{ margin: "0 4px" }}>
            STOP
          </Button>
          <Button style={{ margin: "0 4px" }}>DSP</Button>
          <Button style={{ margin: "0 4px" }}>SKINS</Button>
          <Button style={{ margin: "0 4px" }}>PREVIEW</Button>
          <Button style={{ margin: "0 4px" }}>REPLAY</Button>
        </Row>
      </Col>
      <Col
        span={12}
        style={{
          background: "black",
          padding: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playlist.length > 0 && (
          <video
            key={playlist[0].filePath}
            src={`http://localhost:8000/songs/stream?file=${encodeURIComponent(
              playlist[0].filePath,
            )}`}
            autoPlay
            controls
            playsInline
            preload="auto"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onEnded={(e) => {
              removeSong(playlist?.[0]);
            }}
          />
        )}
      </Col>
    </Row>
  );
}

export default Home;
