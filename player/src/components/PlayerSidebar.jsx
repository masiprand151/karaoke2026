import { Col, Typography, Flex, Button } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import PlaylistTable from "./PlaylistTable";

const { Title } = Typography;

function PlayerSidebar({ playlist }) {
  return (
    <Col span={7} style={{ padding: 8 }}>
      <Title level={5} style={{ color: "#00ffff" }}>
        PLAYLIST
      </Title>

      <PlaylistTable />

      <div style={{ color: "#fff", marginBottom: 16 }}>
        Sekarang: {playlist[0]?.name}
      </div>

      <div
        style={{
          background: "#222",
          padding: 12,
          borderRadius: 8,
        }}
      >
        {/* volume */}
        <div style={{ color: "#fff", marginBottom: 16 }}>VOLUME</div>

        <Flex justify="space-around" align="center" style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<MinusOutlined />}
          />

          <div
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            10
          </div>

          <Button
            type="primary"
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<PlusOutlined />}
          />
        </Flex>

        {/* pitch */}
        <div style={{ color: "#fff", marginBottom: 16 }}>PITCH</div>

        <Flex justify="space-around" align="center">
          <Button
            type="primary"
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<MinusOutlined />}
          />

          <div
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            10
          </div>

          <Button
            type="primary"
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
    </Col>
  );
}

export default PlayerSidebar;
