import { useEffect, useState } from "react";

export default function useSongs(folderPath) {
  const [vid, setVid] = useState([]);

  useEffect(() => {
    window.electron.getSongs("get-songs", folderPath).then(setVid);
  }, [folderPath]);

  return vid;
}
