import { Row, Col } from "antd";
import { useEffect, useState, useRef } from "react";

import api from "../utils/api";
import { usePlaylist } from "../contexts/PlaylistContext";

import CategoryHeader from "../components/CategoryHeader";
import SongList from "../components/SongList";
import PlayerSidebar from "../components/PlayerSidebar";
import PlayerControls from "../components/PlayerControls";
import VideoPlayer from "../components/VideoPlayer";
import useBackgroundTheme from "../hooks/useBackgroundTheme";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import useSetting from "../hooks/useSetting";
import useRoomSession from "../hooks/useRoomSession";

function Home() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [pitch, setPitch] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { playlist, addSong, removeSong, setPlaylist } = usePlaylist();
  const [seekTime, setSeekTime] = useState(0);
  const [seekOffset, setSeekOffset] = useState(0);
  const [streamVersion, setStreamVersion] = useState(0);
  const [audioChannel, setAudioChannel] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const location = useLocation();
  const { setting } = useSetting();
  const navigate = useNavigate();
  const rowRefs = useRef([]);
  const videoRef = useRef(null);
  const { maintenance, checkin } = location.state || {};

  const backgroundUrl = "http://127.0.0.1:8765/background";
  const backgroundTheme = useBackgroundTheme(backgroundUrl);
  const { mode, isMaintenance, isCheckin, remainingSeconds, remainingText } =
    useRoomSession({
      maintenance,
      checkin,
      maintenanceMinutes: setting?.cstime ?? 10,
    });

  const getSongs = async (q = "", currentPage = 1, append = false) => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/songs?search=${encodeURIComponent(q)}&page=${currentPage}&limit=50`,
      );

      if (append) {
        setSongs((prev) => [...prev, ...res.songs]);
      } else {
        setSongs(res.songs);
      }

      setHasMore(res.hasMore);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);

      getSongs(query, 1, false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;

    setPage(nextPage);

    await getSongs(query, nextPage, true);
  };

  useEffect(() => {
    if (!playlist.length) {
      setSeekOffset(0);
      setCurrentTime(0);
      setStreamVersion(0);
      return;
    }

    const file = playlist[0].filePath;

    fetch(`http://127.0.0.1:8765/metadata?file=${encodeURIComponent(file)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Metadata error: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setDuration(Number(data.duration) || 0);
        setCurrentTime(0);
      })
      .catch((error) => {
        console.error("METADATA ERROR:", error);
      });
  }, [playlist[0]?.filePath]);

  const handlePlayPause = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    const video = videoRef.current;

    if (!video) return;

    video.pause();
    video.currentTime = 0;

    setIsPlaying(false);
    setIsStopped(true);
  };

  const handleNext = () => {
    // Jika tidak ada lagu berikutnya, BLOKIR NEXT
    if (playlist.length <= 1) {
      return;
    }

    const current = playlist[0];
    const next = playlist[1];

    // hapus lagu pertama

    setPlaylist((prev) => prev.slice(1));

    setSeekOffset(0);
    setCurrentTime(0);
    setStreamVersion(0);

    // Kalau lagu berikutnya file yang SAMA
    if (current.filePath === next.filePath) {
      requestAnimationFrame(() => {
        const video = videoRef.current;

        if (!video) return;

        video.currentTime = 0;
        video.play().catch(console.error);
      });
    }

    setIsPlaying(true);
    setIsStopped(false);
  };

  // handle volume
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;
    video.volume = volume / 100;
  }, [volume]);

  // handle slider
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleTimeUpdate = () => {
      const realTime = seekOffset + video.currentTime;

      setCurrentTime(realTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [playlist[0]?.filePath, seekOffset, streamVersion]);

  const handleSeek = (value) => {
    setSeekOffset(value);
    setCurrentTime(value);

    // paksa VideoPlayer membuat stream baru
    setStreamVersion((prev) => prev + 1);
  };

  useEffect(() => {
    setSeekOffset(0);
    setCurrentTime(0);
    setStreamVersion(0);
  }, [playlist[0]?.key]);

  return (
    <ConfigProvider
      theme={{
        algorithm: backgroundTheme.isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,

        token: {
          colorPrimary: backgroundTheme.primaryColor,
          colorText: backgroundTheme.textColor,
        },
        components: {
          Button: {
            // tombol biasa
            defaultColor: backgroundTheme.textColor,

            // hover tombol biasa
            defaultHoverColor: backgroundTheme.isDark ? "#ffffff" : "#000000",
            defaultHoverBorderColor: backgroundTheme.isDark
              ? "#ffffff"
              : "#000000",

            // primary
            primaryColor: "#ffffff",
          },
        },
      }}
    >
      <Row style={{ height: "100vh" }}>
        <Col
          span={12}
          style={{
            backgroundImage: 'url("http://127.0.0.1:8765/background")',

            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <CategoryHeader />

          <Row
            gutter={{
              xs: 8,
              sm: 16,
              md: 24,
              lg: 32,
            }}
            style={{ height: "80%" }}
            justify={"center"}
          >
            <SongList
              songs={songs}
              loading={loading}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              addSong={addSong}
              rowRefs={rowRefs}
              query={query}
              setQuery={setQuery}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />

            <PlayerSidebar
              playlist={playlist}
              volume={volume}
              setVolume={setVolume}
              pitch={pitch}
              setPitch={setPitch}
            />
          </Row>

          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            onNext={handleNext}
            onRepeat={() => setRepeat((prev) => !prev)}
            isRepeat={repeat}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            audioChannel={audioChannel}
            setAudioChannel={setAudioChannel}
          />
        </Col>

        <VideoPlayer
          videoRef={videoRef}
          playlist={playlist}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setPlaylist={setPlaylist}
          setIsStopped={setIsStopped}
          isStopped={isStopped}
          isRepeat={repeat}
          seekTime={seekTime}
          seekOffset={seekOffset}
          streamVersion={streamVersion}
          volume={volume}
          onNext={handleNext}
          pitch={pitch}
          audioChannel={audioChannel}
          remainingSeconds={remainingSeconds}
          remainingText={remainingText}
        />
      </Row>
    </ConfigProvider>
  );
}

export default Home;
