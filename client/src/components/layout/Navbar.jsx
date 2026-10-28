
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // Demo role only; real authentication will come from the backend.
  const role = sessionStorage.getItem("demoRole");

  function handleLogout() {
    sessionStorage.removeItem("demoRole");
    navigate("/login");
  }

  let navLinks = [];

  if (role === "ADMIN") {
    navLinks = [
      { label: "Manage Venues", path: "/admin/venues" },
      { label: "Venues", path: "/venues" },
    ];
  } else if (role === "APPROVER") {
    navLinks = [
      { label: "Venues", path: "/venues" },
      { label: "Approvals", path: "/approvals" },
    ];
  } else if (role === "BOOKER") {
    navLinks = [
      { label: "Venues", path: "/venues" },
      { label: "My Bookings", path: "/my-bookings" },
    ];
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="COEP Spaces home">
        <span className="brand-mark">C</span>
        <span>COEP Spaces</span>
      </Link>

      <nav className="nav-actions" aria-label="Main navigation">
        {role ? (
          <>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                className="login-link"
                to={item.path}
              >
                {item.label}
              </Link>
            ))}

            <button
              className="register-button"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="login-link" to="/login">
              Login
            </Link>

            <Link className="register-button" to="/register">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
