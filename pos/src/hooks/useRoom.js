import { useEffect, useState } from "react";
import api from "../services/api";

export default function useRoom() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get("/room");
      setData(res.rooms);
    })();
  }, []);

  return { data, loading };
}
