import { Row, Col, Flex, Button } from "antd";

import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  ForwardOutlined,
  AudioOutlined,
  PhoneOutlined,
  BorderOutlined,
  MessageOutlined,
} from "@ant-design/icons";

function PlayerControls({ isPlaying }) {
  const buttonStyle = {
    width: 64,
    height: 64,
    fontSize: 28,
  };

  return (
    <Row
      gutter={16}
      style={{
        height: "12%",
      }}
    >
      <Col span={16}>
        <Flex justify="space-around">
          <Button icon={<RedoOutlined />} type="primary" style={buttonStyle} />

          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            type="primary"
            style={buttonStyle}
          />

          <Button
            icon={<ForwardOutlined />}
            type="primary"
            style={buttonStyle}
          />

          <Button
            icon={<BorderOutlined />}
            type="primary"
            style={buttonStyle}
          />

          <Button icon={<AudioOutlined />} type="primary" style={buttonStyle} />

          <Button icon={<PhoneOutlined />} type="primary" style={buttonStyle} />

          <Button
            icon={<MessageOutlined />}
            type="primary"
            style={buttonStyle}
          />
        </Flex>
      </Col>

      <Col span={7}>lkl</Col>
    </Row>
  );
}

export default PlayerControls;
