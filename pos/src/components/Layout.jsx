import {
  BsBarChart,
  BsBoxSeam,
  BsCupHot,
  BsDisplay,
  BsGear,
  BsHeart,
  BsList,
  BsMicFill,
  BsMusicNoteList,
  BsPerson,
  BsPower,
  BsReceipt,
  BsSpeedometer2,
} from "react-icons/bs";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import useStorage from "../hooks/useStorage";

export default function Layout() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const auth = useAuth();
  const navigate = useNavigate();
  const [setting] = useStorage("setting");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const time = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const date = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isAdmin = auth?.user?.role === "admin";

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <BsMicFill />
          </div>

          <div>
            <div className="brand-title">KARAOKE POS</div>

            <div className="brand-subtitle">CASHIER</div>
          </div>
        </div>

        <nav className="nav flex-column mt-4">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <BsSpeedometer2 />
            <span>Dashboard</span>
          </NavLink>

          {isAdmin && (
            <>
              <NavLink
                to="/transaction"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsReceipt />
                <span>Transaction</span>
              </NavLink>

              <NavLink
                to="/fnb"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsCupHot />
                <span>F&B</span>
              </NavLink>

              <NavLink
                to="/companion"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsHeart />
                <span>Companion</span>
              </NavLink>
              <NavLink
                to="/user"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsPerson />
                <span>User</span>
              </NavLink>

              <NavLink
                to="/package"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsBoxSeam />
                <span>Package</span>
              </NavLink>

              <NavLink
                to="/songs"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsMusicNoteList />
                <span>Songs</span>
              </NavLink>

              <NavLink
                to="/report"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsBarChart />
                <span>Report</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <BsGear />
                <span>Settings</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/logout"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""} text-danger`
            }
          >
            <BsPower />
            <span>Logout</span>
          </NavLink>
        </nav>

        <div className="server-box mt-auto">
          <div className="fw-semibold mb-2">
            <i className="bi bi-display me-2" />
            <BsDisplay className="me-2" />
            Server Info
          </div>

          <div className="small ms-2 mb-2">
            {String(setting?.server)
              ?.replace("http://", "")
              .replace("https://")}
          </div>

          <div className="small ms-2">
            Versi: {setting?.version || "Beta Test"}
          </div>
        </div>
      </aside>

      {/* AREA KANAN */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="fw-semibold">Room Status</div>

          <div className="text-success small">
            <span>●</span> Terhubung ke Server
          </div>

          <div className="ms-auto text-end">
            <div className="fw-bold">{time}</div>

            <small className="text-secondary">{date}</small>
          </div>

          <div className="user-box ms-4">
            <div className="avatar">
              <BsPerson />
            </div>

            <div>
              <div className="fw-semibold">{auth?.user?.username}</div>
              <small>{auth?.user?.role}</small>
            </div>

            <i className="bi bi-chevron-down ms-3" />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page-content flex-grow-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
