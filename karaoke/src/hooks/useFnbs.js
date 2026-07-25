import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../contexts/AlertContext";

/**
 *
 * @param {number} sessionId
 * @returns
 */
function useFnbs(sessionId) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [fnbs, setFnbs] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFnb, setSelectedFnb] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);

  const getFnbs = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/fnb?search=${query}`);
      setFnbs(res.fnbs);
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFnbs(query);
  }, [query]);

  const addToCart = (fnb) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === fnb.id);
      if (existing) {
        return prev.map((item) =>
          item.id === fnb.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...fnb, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmOrder = async (e) => {
    e.preventDefault();

    try {
      const res = await Promise.all(
        cart.map(async (item) => {
          return api.post("/fnb/order", {
            sessionId: Number(sessionId),
            fnbId: item.id,
            quantity: item.quantity,
          });
          return true;
        }),
      );
      // alert("Yey! berhasil order");
      showAlert({ type: "success", message: "Yey! berhasil order" });
      navigate(-1);
      setCart([]);
    } catch (error) {
      showAlert({ type: "error", message: error.message });
    }
  };

  return {
    fnbs,
    query,
    error,
    loading,
    cart,
    setFnbs,
    setQuery,
    setError,
    setLoading,
    getFnbs,
    confirmOrder,
    addToCart,
    removeFromCart,
  };
}

export default useFnbs;
