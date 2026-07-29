import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Protected from "./components/Protected";
import Checkin from "./pages/Checkin";
import Preview from "./pages/Preview";
import OrderFnb from "./pages/OrderFnb";
import OrderLady from "./pages/OrderLady";
import Payment from "./pages/Payment";

import "./index.css";
import User from "./pages/admin/User";
import Lady from "./pages/admin/Lady";
import Fnb from "./pages/admin/Fnb";
import Package from "./pages/admin/Package";
import Songs from "./pages/admin/Songs";

function App() {
  const [user, setUser] = useState({});
  const location = useLocation();

  useEffect(() => {
    const user = JSON.stringify(window.localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, [user]);

  return (
    <>
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
              <Checkin key={location.pathname} />
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
          path="/payment/:sessionId"
          element={
            <Protected>
              <Payment />
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
        {/* Admin */}
        <Route path="/admin">
          <Route
            path="user"
            element={
              <Protected>
                <User />
              </Protected>
            }
          />
          <Route
            path="lady"
            element={
              <Protected>
                <Lady />
              </Protected>
            }
          />
          <Route
            path="fnb"
            element={
              <Protected>
                <Fnb />
              </Protected>
            }
          />
          <Route
            path="package"
            element={
              <Protected>
                <Package />
              </Protected>
            }
          />
          <Route
            path="songs"
            element={
              <Protected>
                <Songs />
              </Protected>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
