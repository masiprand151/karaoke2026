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

  const { playlist, addSong, removeSong, setPlaylist } = usePlaylist();

  const rowRefs = useRef([]);

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

          <PlayerSidebar playlist={playlist} />
        </Row>

        <PlayerControls isPlaying={isPlaying} />
      </Col>

      <VideoPlayer
        playlist={playlist}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setPlaylist={setPlaylist}
      />
    </Row>
  );
}

export default Home;
