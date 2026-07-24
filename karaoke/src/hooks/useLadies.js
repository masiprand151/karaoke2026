import { useState, useEffect } from "react";
import api from "../utils/api";

function useLadies(sessionId) {
  const [ladies, setLadies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState({});
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLady = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/lady?search=${query}`);
      setLadies(res.ladies);
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLady(query);
  }, [query]);

  const handleMin = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity <= 1 ? 1 : prev.quantity - 1,
      };
    });
  };

  const handlePlus = () => {
    setSelected((prev) => {
      return {
        ...prev,
        quantity: prev.quantity >= 10 ? 10 : prev.quantity + 1,
      };
    });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/lady/order", {
        sessionId,
        ladyId: selected.id,
        quantity: selected.quantity,
      });

      alert(`Berhasil order lady ${selected.name}`);
      setShow(false);
      setSelected({});
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  return {
    ladies,
    query,
    selected,
    show,
    error,
    loading,
    handleMin,
    handlePlus,
    handleOrder,
    setLadies,
    setQuery,
    setShow,
    setSelected,
    getLadies: fetchLady,
  };
}

export default useLadies;
