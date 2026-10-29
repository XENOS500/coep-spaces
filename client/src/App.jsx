
import { BrowserRouter, Routes, Route, Link,useNavigate, } from "react-router-dom";
import { clearSession } from "./services/api.js";
import { useAuth } from "./services/authContext.js";
import RequireAuth from "./components/RequireAuth.jsx";
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
          <span className="home-brand-mark">C</span>
          <span>COEP Spaces</span>
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
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">COEP TECHNOLOGICAL UNIVERSITY</p>

            <h1>
              Make room
              <br />
              <span>for great ideas.</span>
            </h1>

            <p className="home-description">
              A simpler way for the COEP community to discover campus
              venues and organise classes, meetings, events and more.
            </p>

            <div className="home-hero-actions">
            <Link
              to={user ? dashboardPath : "/login"}
              className="home-primary-button"
            >
              {user ? "Go to dashboard" : "Get started"}
              {" "}<span aria-hidden="true">↗</span>
            </Link>

            {!user && (
              <Link to="/register" className="home-secondary-button">
                Create an account
              </Link>
            )}
          </div>

            <p className="home-supporting-note">
              Discover a space. Make a request. Bring people together.
            </p>
          </div>

          <div className="home-hero-visual">
            <img
              className="home-hero-image"
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85"
              alt="University campus building surrounded by greenery"
            />

            <div className="home-image-label">
              <span className="home-image-label-dot" />
              <div>
                <strong>One campus. Many possibilities.</strong>
                <span>Spaces for learning, collaboration and events.</span>
              </div>
            </div>

            <span className="home-image-index">COEP / SPACES</span>
          </div>
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
              <span className="home-step-number">01 / DISCOVER</span>
              <h3>Find your space</h3>
              <p>
                Explore venues and check details such as capacity,
                location and available facilities.
              </p>
            </article>

            <article className="home-step">
              <span className="home-step-number">02 / REQUEST</span>
              <h3>Plan your event</h3>
              <p>
                Select a date and time, add your purpose, and submit
                your booking request.
              </p>
            </article>

            <article className="home-step">
              <span className="home-step-number">03 / CONFIRM</span>
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
          <Link to={user ? "/venues" : "/login"} className="home-primary-button">
            Explore COEP Spaces <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className="home-footer">
        <Link to="/" className="home-brand">
          <span className="home-brand-mark">C</span>
          <span>COEP Spaces</span>
        </Link>
        <p>Campus spaces, made easier to organise.</p>
        <span>COEP Technological University</span>
      </footer>
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

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/venues" element={<VenueCatalogPage />} />
          <Route path="/venue/:id" element={<VenueDetailsPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
        <Route element={<RequireAuth roles={["APPROVER"]} />}>
          <Route path="/approvals" element={<ApprovalsPage />} />
        </Route>
        <Route element={<RequireAuth roles={["ADMIN"]} />}>
          <Route path="/admin/venues" element={<ManageVenuesPage />} />
          <Route path="/admin/venues/new" element={<VenueFormPage />} />
          <Route path="/admin/venues/:id/edit" element={<VenueFormPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
