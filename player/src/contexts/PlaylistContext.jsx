import { useState, useEffect, createContext, useContext } from "react";

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);

  const addSong = (song) => {
    setPlaylist((prev) => [
      ...prev,
      { ...song, key: Date.now() + Math.random() },
    ]);
  };

  const removeSong = (id) => {
    setPlaylist((prev) => prev.filter((s) => s.key !== id));
  };

  const clearPlaylist = () => {
    setPlaylist((prev) => {
      // simpan hanya elemen pertama (index 0)
      return prev.length > 0 ? [prev[0]] : [];
    });
  };

  return (
    <PlaylistContext.Provider
      value={{ playlist, addSong, removeSong, clearPlaylist, setPlaylist }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

// custom hook untuk akses playlist
export function usePlaylist() {
  return useContext(PlaylistContext);
}
