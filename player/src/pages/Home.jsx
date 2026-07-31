import { Row, Col, Button, Input, Typography, Table, Slider } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

function Home() {
  // dummy
  const songs = [
    { title: "AKU TERJATUH", singer: "ST12" },
    { title: "AKU YANG TERSAKITI", singer: "JUDIKA" },
    { title: "AW AW", singer: "MELINDA" },
  ];

  const columnsTitle = [
    { title: "Title", dataIndex: "title" },
    { title: "Singer", dataIndex: "singer" },
  ];

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
              dataSource={songs}
              columns={columnsTitle}
              pagination={false}
              size="small"
              sticky
              style={{
                flex: 1,
              }}
              scroll={{ y: "calc(100% - 100px)" }}
            />
          </Col>

          {/* Kolom kanan: playlist + video */}
          <Col span={7} style={{ padding: 8 }}>
            <Title level={5} style={{ color: "#00ffff" }}>
              PLAYLIST
            </Title>
            <div style={{ height: "60%", background: "#111", marginBottom: 8 }}>
              {/* <video src="sample.mp4" controls style={{ width: "100%", height: "100%" }} /> */}
            </div>
            <div style={{ color: "#fff", marginBottom: 16 }}>
              JUMLAH LAGU: 0
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
      <Col span={12}>2</Col>
    </Row>
  );
}

export default Home;
