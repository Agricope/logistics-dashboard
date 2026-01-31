import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import PrimaryButton from "./PrimaryButton.jsx";
import "./AdminSidebar.css"; // For custom sidebar styles

const navItems = [
  {
    label: "Dashboard",
    icon: "/icons/dashboard.svg",
    to: "/dashboard"
  },
  {
    label: "Admin Management",
    icon: "/icons/admin.svg",
    to: "/admin-management"
  },
  {
    label: "Driver Management",
    icon: "/icons/technician.svg",
    to: "/drivers"
  },
  {
    label: "Vehicle Management",
    icon: "/icons/vehicle.svg",
    to: "/vehicles"
  },
  // {
  //   label: "Live Map",
  //   icon: "/icons/map.svg",
  //   to: "/live-map"
  // },
  {
    label: "Delivery Management",
    icon: "/icons/job.svg",
    to: "/deliveries"
  },
  // {
  //   label: "Client Management",
  //   icon: "/icons/user.svg",
  //   to: "/clients"
  // },
  {
    label: "Performance",
    icon: "/icons/performance.svg",
    to: "/performance"
  },
  // {
  //   label: "Calls",
  //   icon: "/icons/call.svg",
  //   to: "/calls"
  // },
  {
    label: "Source Configurator",
    icon: "/icons/configurator.svg",
    to: "/sources"
  },
  {
    label: "Vehicle Insurance",
    icon: "/icons/insurance.svg",
    to: "/vehicle-insurance"
  }
];

function AdminSidebar({ isOpen = true }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className={`admin-sidebar${isOpen ? "" : " sidebar-collapsed"}`}>
      <div className="sidebar-logo">
        <NavLink to="/dashboard">
          <img src="/logo/Logo.svg" alt="Clicks Logo" className="logo-img" />
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "sidebar-nav-item" +
              (isActive ? " active" : "")
            }
          >
            <img src={item.icon} alt={item.label + " icon"} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom-container">
        <PrimaryButton width="220px" height="44px" onClick={handleLogout}>
          Logout
        </PrimaryButton>
      </div>
    </aside>
  );
}

export default AdminSidebar;
