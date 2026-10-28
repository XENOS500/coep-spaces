
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VenueCatalogPage from "./pages/VenueCatalogPage";
import VenueDetailsPage from "./pages/VenueDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ManageVenuesPage from "./pages/admin/ManageVenuesPage";
import VenueFormPage from "./pages/admin/VenueFormPage";

// Home page
function HomePage() {
  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">
          COEP <span>Spaces</span>
        </Link>

        <nav className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="nav-register-button">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">YOUR CAMPUS, YOUR SPACE</p>

            <h1>
              Find the right space
              <br />
              for what matters.
            </h1>

            <p className="hero-description">
              A simpler way for the COEP community to discover campus venues
              and organise classes, meetings, events and more.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-button">
                Get started
              </Link>

              <Link to="/register" className="secondary-button">
                Create an account
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85"
              alt="University campus building"
            />
            <div className="hero-image-caption">
              <span>COEP TECHNOLOGICAL UNIVERSITY</span>
              <span>Spaces for every occasion</span>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <p className="eyebrow">MADE FOR CAMPUS LIFE</p>
          <h2>From idea to booked.</h2>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Discover</h3>
              <p>
                Explore campus venues and compare their capacity, location
                and facilities.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Request</h3>
              <p>
                Choose a date and time, provide the details and submit your
                booking request.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Get approval</h3>
              <p>
                Follow your booking status while the assigned approver
                reviews your request.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link to="/" className="logo">
          COEP <span>Spaces</span>
        </Link>
        <p>Campus spaces, made easier to organise.</p>
        <span>COEP Technological University</span>
      </footer>
    </>
  );
}

// Fallback page for unknown URLs
function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This space doesn't exist.</h1>
      <p>
        The page may have moved, or the address may be incorrect.
      </p>
      <Link to="/" className="primary-button">
        Return home
      </Link>
    </main>
  );
}

// Application routes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Booker pages */}
        <Route path="/venues" element={<VenueCatalogPage />} />
        <Route path="/venue/:id" element={<VenueDetailsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />

        {/* Approver page */}
        <Route path="/approvals" element={<ApprovalsPage />} />

        {/* Admin pages */}
        <Route path="/admin/venues" element={<ManageVenuesPage />} />
        <Route
          path="/admin/venues/new"
          element={<VenueFormPage />}
        />
        <Route
          path="/admin/venues/:id/edit"
          element={<VenueFormPage />}
        />

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
