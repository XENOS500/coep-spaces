
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, clearSession } from "../../services/api.js";

const menuByRole = {
  ADMIN: [
    { label: "Manage Venues", path: "/admin/venues", icon: "▦" },
    { label: "Browse Venues", path: "/venues", icon: "⌂" },
  ],
  APPROVER: [
    { label: "Browse Venues", path: "/venues", icon: "⌂" },
    { label: "Approvals", path: "/approvals", icon: "✓" },
  ],
  REQUESTER: [
    { label: "Browse Venues", path: "/venues", icon: "⌂" },
    { label: "My Bookings", path: "/my-bookings", icon: "▤" },
  ],
  BOOKER: [
    { label: "Browse Venues", path: "/venues", icon: "⌂" },
    { label: "My Bookings", path: "/my-bookings", icon: "▤" },
  ],
};

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role;
  const links = menuByRole[role] || [];

  const name = user?.name || user?.fullName || user?.email || "User";
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-heading">
          <span className="sidebar-section-label">WORKSPACE</span>
        </div>

        <nav className="sidebar-navigation" aria-label="Workspace navigation">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <span className="sidebar-section-label">YOUR ACCOUNT</span>

          <div className="sidebar-profile">
            <div className="sidebar-avatar">{initials || "U"}</div>

            <div className="sidebar-profile-details">
              <span className="sidebar-profile-name">{name}</span>
              <span className="sidebar-profile-role">
                {role || "Member"}
              </span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            type="button"
            onClick={handleLogout}
          >
            <span aria-hidden="true">↗</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
