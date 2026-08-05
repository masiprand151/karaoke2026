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
  AudioMutedOutlined,
} from "@ant-design/icons";
import { useSocket } from "../hooks/useSocket";
import useSetting from "../hooks/useSetting";

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
  setAudioChannel,
  audioChannel,
}) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const { setting } = useSetting();
  const { emit, on } = useSocket(setting?.server);

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

  useEffect(() => {
    console.log(setting);

    // join room
    emit("room-join", {
      roomId: setting?.roomId,
      name: setting?.roomName,
    });
  }, [setting]);

  return (
    <Row
      gutter={16}
      style={{
        height: "12%",
      }}
      justify={"center"}
    >
      <Col span={16}>
        <Flex justify="space-around">
          <Button
            icon={<RedoOutlined />}
            danger={isRepeat}
            style={buttonStyle}
            onClick={onRepeat}
          />

          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            style={buttonStyle}
            onClick={onPlayPause}
          />

          <Button
            icon={<ForwardOutlined />}
            style={buttonStyle}
            onClick={onNext}
          />

          <Button
            icon={<BorderOutlined />}
            style={buttonStyle}
            onClick={onStop}
          />

          <Button
            icon={audioChannel ? <AudioOutlined /> : <AudioMutedOutlined />}
            type="primary"
            style={buttonStyle}
            onClick={() => setAudioChannel((prev) => !prev)}
          />

          <Button
            icon={<PhoneOutlined />}
            type="primary"
            style={buttonStyle}
            onClick={() =>
              emit("call", {
                roomId: setting?.roomId,
                name: setting?.roomName,
              })
            }
          />

          <Button icon={<MessageOutlined />} style={buttonStyle} />
        </Flex>
      </Col>

      <Col span={7}>
        <Flex>
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
              borderRadius: 10,
              flex: 1,
            }}
          />
        </Flex>
      </Col>
    </Row>
  );
}

export default PlayerControls;
