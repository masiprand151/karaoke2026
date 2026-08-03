import { Col, Typography } from "antd";
import useKaraokeAudio from "../hooks/useKaraokeAudio";
import { useEffect, useState } from "react";

const { Title } = Typography;

function VideoPlayer({
  videoRef,
  playlist,
  setIsPlaying,
  setPlaylist,
  setIsStopped,
  isStopped,
  isRepeat,
  seekOffset,
  streamVersion,
  volume,
  onNext,
  pitch,
  audioChannel,
  remainingSeconds,
  remainingText,
  runningTexts,
}) {
  const currentSong = playlist[0];
  const { setupAudio } = useKaraokeAudio(videoRef, pitch, volume, audioChannel);
  const [runningText, setRunningText] = useState(null);

  const isFiveMinutesLeft = remainingSeconds > 0 && remainingSeconds <= 5 * 60;

  useEffect(() => {
    const playNow = playlist[0]?.name;
    const playNext = playlist[1]?.name;
    const artistNow = playlist[0]?.artist;
    const artistNext = playlist[1]?.artist;
    setRunningText(
      runningTexts
        ? runningTexts
        : [
            "Selamat menikmati karaoke bersama kami",
            "Dilarang membawa obat-obatan terlarang",
            playNow && `Sekarang: ${playNow} - ${artistNow}`,
            playNext && `Next: ${playNext} - ${artistNext}`,
          ]
            .filter(Boolean)
            .join(" • "),
    );
  }, [playlist[0]?.key]);

  return (
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
      <div
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 100000,
          top: 0,
          left: 0,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          background: "rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* REMAINING TIME */}
        <Title
          level={3}
          type={isFiveMinutesLeft ? "danger" : "success"}
          style={{
            margin: 0,
            flexShrink: 0,
            marginRight: 20,
          }}
        >
          {remainingText}
        </Title>

        {/* RUNNING TEXT */}
        <div
          className="running-text-container"
          style={{
            flex: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <div className="running-text">
            <Title
              level={3}
              type="success"
              style={{
                textTransform: "uppercase",
              }}
            >
              {runningText}
            </Title>
          </div>
        </div>
      </div>

      {/* VIDEO KARAOKE */}
      {currentSong && !isStopped && (
        <video
          ref={videoRef}
          // PENTING: paksa video baru ketika seek
          crossOrigin="anonymous"
          // key={`${currentSong.key}-${streamVersion}`}
          src={`http://127.0.0.1:8765/stream?file=${encodeURIComponent(
            currentSong.filePath,
          )}&start=${seekOffset}`}
          autoPlay
          loop={isRepeat}
          playsInline
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
          onEnded={() => {
            // kalau repeat aktif, onEnded tidak perlu mengurus playlist
            if (isRepeat) return;

            onNext?.();
          }}
          onPlay={async () => {
            await setupAudio();
            setIsPlaying(true);
            setIsStopped(false);
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onLoadedMetadata={(e) => {
            e.currentTarget.volume = volume / 100;
          }}
          onCanPlay={(e) => {
            e.currentTarget.volume = volume / 100;
          }}
        />
      )}

      {/* WALLPAPER */}
      {(!currentSong || isStopped) && (
        <video
          key="wallpaper"
          src="http://127.0.0.1:8765/wallpaper"
          autoPlay
          loop
          playsInline
          muted
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      )}
    </Col>
  );
}

export default VideoPlayer;
