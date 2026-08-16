import { useState, useEffect } from "react";
import { useAlert } from "../contexts/AlertContext";
import api from "../utils/api";

function useUser() {
  const { showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const getUsers = async (search = "") => {
    try {
      const res = await api.get(`/user?search=${search}`);
      setUsers(res.users);
    } catch (error) {
      showAlert({
        type: "error",
        message: error.message,
      });
    }
  };

  useEffect(() => {
    getUsers(search);
  }, [search]);

  return {
    users,
    getUsers,
    query: search,
    setQuery: setSearch,
  };
}

export default useUser;
