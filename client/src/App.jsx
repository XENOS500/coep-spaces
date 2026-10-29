
import { BrowserRouter, Routes, Route, Link,useNavigate, Outlet } from "react-router-dom";
import { clearSession } from "./services/api.js";
import { useAuth } from "./services/authContext.js";
import RequireAuth from "./components/RequireAuth.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Brand from "./components/Brand.jsx";
import campusPhoto from "./assets/coep-campus.png";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VenueCatalogPage from "./pages/venues/VenueCatalogPage";
import VenueDetailsPage from "./pages/venues/VenueDetailsPage";
import MyBookingsPage from "./pages/bookings/MyBookingsPage";
import ApprovalsPage from "./pages/approver/ApprovalsPage";
import ManageVenuesPage from "./pages/admin/ManageVenuesPage";
import VenueFormPage from "./pages/admin/VenueFormPage";


import "./index.css";

function HomePage() {
  const { user } = useAuth();
const navigate = useNavigate();

const dashboardPath =
  user?.role === "ADMIN"
    ? "/admin/venues"
    : user?.role === "APPROVER"
      ? "/approvals"
      : "/venues";

function handleLogout() {
  clearSession();
  navigate("/login", { replace: true });
}
  return (
    <div className="home-page">
      <header className="home-navbar">
        <Link to="/" className="home-brand" aria-label="COEP Spaces home">
          <Brand />
        </Link>

        <nav className="home-nav-actions" aria-label="Main navigation">
          {user ? (
            <>
              <Link to={dashboardPath} className="home-login-link">Dashboard</Link>
              <button type="button" className="home-register-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="home-login-link">Login</Link>
              <Link to="/register" className="home-register-link">Create an account</Link>
            </>
          )}
        </nav>
      </header>

      <main className="home-main">
        <section className="home-hero home-hero--campus" aria-labelledby="home-hero-title">
          <img className="home-hero-image" src={campusPhoto} alt="Historic stone building on the COEP campus, framed by trees" fetchPriority="high" />
          <div className="home-hero-shade" aria-hidden="true" />
          <div className="home-hero-copy">
            <p className="home-eyebrow">COEP TECHNOLOGICAL UNIVERSITY</p>
            <h1 id="home-hero-title">Request. Review.<br /><span>Reserve.</span></h1>
            <p className="home-description">Find the right place for your next class, conversation or big idea. Discover and book spaces across our campus, all in one place.</p>
            <div className="home-hero-actions">
              <Link to={user ? dashboardPath : "/login"} className="home-primary-button">
                {user ? "Go to dashboard" : "Find your space"} <span aria-hidden="true">↗</span>
              </Link>
              {!user && <Link to="/register" className="home-secondary-button">Create an account</Link>}
            </div>
            <p className="home-supporting-note">Classrooms. Seminar halls. Room for possibility.</p>
          </div>
          <div className="home-campus-caption"><span className="home-campus-caption-line" />SHIVAJINAGAR, PUNE</div>
        </section>

        <section className="home-how-section">
          <div className="home-section-heading">
            <p className="home-eyebrow">A BETTER WAY TO GET TOGETHER</p>
            <h2>From available space to a plan in motion.</h2>
            <p>
              Find the right venue and keep track of your booking request
              in one place.
            </p>
          </div>

          <div className="home-steps">
            <article className="home-step">
              <span className="home-step-label">DISCOVER</span>
              <h3>Find your space</h3>
              <p>
                Explore venues and check details such as capacity,
                location and available facilities.
              </p>
            </article>

            <article className="home-step">
              <span className="home-step-label">REQUEST</span>
              <h3>Plan your event</h3>
              <p>
                Select a date and time, add your purpose, and submit
                your booking request.
              </p>
            </article>

            <article className="home-step">
              <span className="home-step-label">CONFIRM</span>
              <h3>Track your booking</h3>
              <p>
                Follow the status of your request while the assigned
                approver reviews it.
              </p>
            </article>
          </div>
        </section>

        <section className="home-bottom-cta">
          <div>
            <p className="home-eyebrow">YOUR NEXT PLAN STARTS HERE</p>
            <h2>Let's make space for it.</h2>
          </div>
          <div className="home-cta-actions">
            <Link to={user ? dashboardPath : "/login"} className="home-primary-button">Explore COEP Spaces <span aria-hidden="true">↗</span></Link>
            <Link to="/admin/login" className="home-secondary-button home-admin-button">Admin login <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Link to="/" className="home-brand">
          <Brand />
        </Link>
        <p>Campus spaces, made easier to organise.</p>
        <span>
          COEP Technological University
          <br />
          <a href="/privacy.html">Privacy Policy</a>{" · "}
          <a href="/terms.html">Terms and Conditions</a>
        </span>
      </footer>
    </div>
  );
}

function WorkspaceLayout() {
  return (
    <div className="app-workspace">
      <Navbar />
      <div className="workspace-body">
        <Sidebar />
        <div className="workspace-content"><Outlet /></div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <main className="home-not-found">
      <p className="home-eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This space doesn't exist.</h1>
      <p>The address may be incorrect, or the page may have moved.</p>
      <Link to="/" className="home-primary-button">
        Return home
      </Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage key="member" />} />
        <Route path="/admin/login" element={<LoginPage key="admin" adminOnly />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/venues" element={<VenueCatalogPage />} />
            <Route path="/venue/:id" element={<VenueDetailsPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route element={<RequireAuth roles={["APPROVER"]} />}>
              <Route path="/approvals" element={<ApprovalsPage />} />
            </Route>
            <Route element={<RequireAuth roles={["ADMIN"]} />}>
              <Route path="/admin/venues" element={<ManageVenuesPage />} />
              <Route path="/admin/venues/new" element={<VenueFormPage />} />
              <Route path="/admin/venues/:id/edit" element={<VenueFormPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
