import { Col, Typography, Flex, Button } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import PlaylistTable from "./PlaylistTable";

const { Title } = Typography;

function PlayerSidebar({
  playlist,
  volume,
  setVolume,
  pitch,
  setPitch,
  down,
  up,
}) {
  const handleVolMin = () => {
    setVolume((prev) => Math.max(prev - 10, 0));
  };
  const handleVolPlus = () => {
    setVolume((prev) => Math.min(prev + 10, 100));
  };

  const handlePitchMin = () => {
    setPitch((prev) => (prev <= -5 ? -5 : prev - 1));
  };

  const handlePitchPlus = () => {
    setPitch((prev) => (prev >= 5 ? 5 : prev + 1));
  };

  return (
    <Col span={7} style={{ padding: 8 }}>
      <Title level={5} style={{ color: "#00ffff" }}>
        PLAYLIST
      </Title>

      <PlaylistTable />
      <div
        style={{
          padding: 12,
          borderRadius: 8,
        }}
      >
        {/* volume */}
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>VOLUME</Title>
        </div>

        <Flex justify="space-around" align="center" style={{ marginBottom: 8 }}>
          <Button
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<MinusOutlined />}
            onClick={handleVolMin}
          />

          <div
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            {volume}
          </div>

          <Button
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<PlusOutlined />}
            onClick={handleVolPlus}
          />
        </Flex>

        {/* pitch */}
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>PITCH</Title>
        </div>

        <Flex justify="space-around" align="center">
          <Button
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<MinusOutlined />}
            onClick={handlePitchMin}
          />

          <div
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            {pitch}
          </div>

          <Button
            style={{
              width: 40,
              height: 40,
              fontSize: 28,
            }}
            icon={<PlusOutlined />}
            onClick={handlePitchPlus}
          />
        </Flex>
      </div>
    </Col>
  );
}

export default PlayerSidebar;
