import { Col } from "antd";
import useKaraokeAudio from "../hooks/useKaraokeAudio";
import { useEffect } from "react";

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
}) {
  const currentSong = playlist[0];
  const { setupAudio } = useKaraokeAudio(videoRef, pitch, volume, audioChannel);

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
