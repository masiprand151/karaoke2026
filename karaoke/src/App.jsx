import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import Protected from "./components/Protected";

function App() {
  const [user, setUser] = useState({});
  useEffect(() => {
    const user = JSON.stringify(window.localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, [user]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
