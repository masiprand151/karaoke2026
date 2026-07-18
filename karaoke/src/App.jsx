import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import Protected from "./components/Protected";
import Checkin from "./pages/Checkin";
import Preview from "./pages/Preview";
import OrderFnb from "./pages/OrderFnb";
import OrderLady from "./pages/OrderLady";

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
        <Route
          path="/checkin/:roomId"
          element={
            <Protected>
              <Checkin />
            </Protected>
          }
        />
        <Route
          path="/preview/:sessionId"
          element={
            <Protected>
              <Preview />
            </Protected>
          }
        />
        <Route
          path="/fnb/order/:sessionId"
          element={
            <Protected>
              <OrderFnb />
            </Protected>
          }
        />
        <Route
          path="/lady/order/:sessionId"
          element={
            <Protected>
              <OrderLady />
            </Protected>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
