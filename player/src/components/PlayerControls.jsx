import { Row, Col, Flex, Button, Slider } from "antd";
import { useEffect, useState } from "react";

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

function PlayerControls({
  isPlaying,
  onPlayPause,
  onStop,
  onNext,
  onRepeat,
  isRepeat,
  currentTime,
  duration,
  onSeek,
}) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const buttonStyle = {
    width: 64,
    height: 64,
    fontSize: 28,
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Sinkronkan slider dengan video
  // tapi jangan saat user sedang drag slider
  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const handleSliderChange = (value) => {
    setIsSeeking(true);
    setSliderValue(value);
  };

  const handleSliderComplete = (value) => {
    setSliderValue(value);
    setIsSeeking(false);

    // Baru seek FFmpeg setelah slider dilepas
    onSeek(value);
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
          <Button
            icon={<RedoOutlined />}
            type="primary"
            danger={isRepeat}
            style={buttonStyle}
            onClick={onRepeat}
          />

          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            type="primary"
            style={buttonStyle}
            onClick={onPlayPause}
          />

          <Button
            icon={<ForwardOutlined />}
            type="primary"
            style={buttonStyle}
            onClick={onNext}
          />

          <Button
            icon={<BorderOutlined />}
            type="primary"
            style={buttonStyle}
            onClick={onStop}
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

      <Col span={7}>
        <Slider
          min={0}
          max={duration || 0}
          value={sliderValue}
          onChange={handleSliderChange}
          onChangeComplete={handleSliderComplete}
          tooltip={{
            formatter: formatTime,
          }}
          style={{
            background: "#989d9f",
            borderRadius: 10,
          }}
        />
      </Col>
    </Row>
  );
}

export default PlayerControls;
