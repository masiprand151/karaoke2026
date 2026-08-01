import { Col } from "antd";

function VideoPlayer({
  videoRef,
  playlist,
  isPlaying,
  setIsPlaying,
  setPlaylist,
}) {
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
      {playlist.length > 0 && (
        <video
          ref={videoRef}
          key={playlist[0].filePath}
          src={`http://127.0.0.1:8765/stream?file=${encodeURIComponent(
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
          onEnded={() => {
            setPlaylist((prev) => {
              const next = prev.slice(1);

              if (next.length === 0) {
                setIsPlaying(false);
              }

              return next;
            });
          }}
          onCanPlay={() => {
            console.log("VIDEO CAN PLAY");
          }}
          onPlay={() => {
            setIsPlaying(true);
          }}
        />
      )}

      {!isPlaying && (
        <video
          key={"wallpaper"}
          src={`http://127.0.0.1:8765/wallpaper`}
          autoPlay
          controls
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
