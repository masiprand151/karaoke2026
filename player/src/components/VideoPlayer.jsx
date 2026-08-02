import { Col } from "antd";

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
}) {
  const currentSong = playlist[0];

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
          key={`${currentSong.filePath}-${streamVersion}`}
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

            setPlaylist((prev) => {
              const next = prev.slice(1);

              if (next.length === 0) {
                setIsPlaying(false);
                setIsStopped(true);
              }

              return next;
            });
          }}
          onCanPlay={() => {
            console.log("VIDEO CAN PLAY");
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsStopped(false);
          }}
          onPause={() => {
            setIsPlaying(false);
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
