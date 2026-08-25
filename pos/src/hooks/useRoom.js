import { useEffect, useState } from "react";
import api from "../services/api";

export default function useRoom() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  const fetchAllRoom = async () => {
    try {
      setLoading(true);
      const res = await api.get("/room");
      setData(res.rooms);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRoom();
  }, []);

  return { data, loading, refresh: fetchAllRoom };
}
