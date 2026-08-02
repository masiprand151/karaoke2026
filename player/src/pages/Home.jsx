import { Row, Col } from "antd";
import { useEffect, useState, useRef } from "react";

import api from "../utils/api";
import { usePlaylist } from "../contexts/PlaylistContext";

import CategoryHeader from "../components/CategoryHeader";
import SongList from "../components/SongList";
import PlayerSidebar from "../components/PlayerSidebar";
import PlayerControls from "../components/PlayerControls";
import VideoPlayer from "../components/VideoPlayer";

function Home() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
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
  const rowRefs = useRef([]);
  const videoRef = useRef(null);

  const getSongs = async (q = "") => {
    try {
      setLoading(true);

      const res = await api.get(`/songs?search=${query}`);

      setSongs(res.songs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // setiap kali activeIndex berubah, scroll ke baris itu
  useEffect(() => {
    if (rowRefs.current[activeIndex]) {
      rowRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    getSongs(query);
  }, [query]);

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
    setPlaylist((prev) => {
      const next = prev.slice(1);

      if (next.length === 0) {
        setIsPlaying(false);
        setIsStopped(true);
      } else {
        setIsPlaying(true);
        setIsStopped(false);
      }

      return next;
    });
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
  }, [playlist[0]?.filePath]);

  return (
    <Row style={{ height: "100vh" }}>
      <Col
        span={12}
        style={{
          background: "radial-gradient(circle, #001529, #000)",
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
        >
          <SongList
            songs={songs}
            loading={loading}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            addSong={addSong}
            rowRefs={rowRefs}
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
      />
    </Row>
  );
}

export default Home;
