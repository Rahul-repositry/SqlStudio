import React, { useState } from "react";
import {
  FiMenu,
  FiX,
  FiDatabase,
  FiLayers,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import "./dashboard.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuItems = [
    {
      group: "Assignments",
      items: [
        { name: "All", icon: <FiLayers />, link: "/dashboard/assignments" },
      ],
    },
    {
      group: "Account",
      items: [
        { name: "My Profile", icon: <FiUser />, link: "/dashboard/profile" },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URI}/api/auth/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("user");
      navigate("/authpage/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile Navbar */}
      <nav className="mobile-navbar">
        <div className="nav-left">
          <button
            className="burger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <span className="logo-text">
            SQL<span className="accent">Studio</span>
          </span>
        </div>
      </nav>

      {/* Sidebar  */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FiDatabase className="logo-icon" />
          <span className="logo-text">
            SQL<span className="accent">Studio</span>
          </span>
        </div>

        <div className="sidebar-content">
          {menuItems.map((section, idx) => (
            <div key={idx} className="menu-group">
              <p className="group-title">{section.group}</p>
              {section.items.map((item) => (
                <a key={item.name} href={item.link} className="menu-item">
                  <span className="icon">{item.icon}</span>
                  <span className="name">{item.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content  */}
      <main className="main-content">
        <div className="page-body">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
