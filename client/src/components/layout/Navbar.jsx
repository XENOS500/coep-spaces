
import { Link } from "react-router-dom";
import { getUser } from "../../services/api.js";

function Navbar() {
  const user = getUser();
  const role = user?.role;

  const roleLabel = {
    REQUESTER: "BOOKER WORKSPACE",
    BOOKER: "BOOKER WORKSPACE",
    APPROVER: "APPROVER WORKSPACE",
    ADMIN: "ADMIN WORKSPACE",
  };

  return (
    <header className="navbar">
      <Link
        className="brand"
        to="/"
        aria-label="COEP Spaces home"
      >
        <span className="brand-mark">C</span>
        <span className="brand-name">COEP Spaces</span>
      </Link>

      <div className="navbar-right">
        <div className="navbar-context">
          <span className="navbar-context-dot" />
          <span>CAMPUS BOOKING PORTAL</span>
        </div>

        {role && (
          <div className="navbar-role">
            <span className="navbar-role-label">SIGNED IN AS</span>
            <span className="navbar-role-value">
              {roleLabel[role] || role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
