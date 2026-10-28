
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'

import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import NotFound from './pages/NotFound.jsx'

function HomePage() {
  return (
    <main className="home-page">
      <Navbar />

      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">COLLEGE OF ENGINEERING PUNE</p>

          <h1>
            The right space
            <br />
            for every <span>big idea.</span>
          </h1>

          <p className="hero-description">
            Discover classrooms, seminar halls and campus venues.
            Check availability and request a space for your next
            academic, cultural or technical event.
          </p>

          <div className="hero-note">
            <span className="note-dot" />
            One campus. Many possibilities.
          </div>
        </div>

        <div className="hero-gallery">
          <img
            className="hero-image hero-image-main"
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80"
            alt="Bright meeting and collaboration space"
          />

          <img
            className="hero-image hero-image-small"
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80"
            alt="Modern room with tables and chairs"
          />

          <div className="gallery-label">
            <span>01 / CAMPUS SPACES</span>
            <strong>Made for ideas to take shape.</strong>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">SIMPLE BY DESIGN</p>
          <h2>How it works</h2>
          <p>From finding a room to sending a booking request.</p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Find your venue</h3>
            <p>
              Explore available campus spaces and review their
              capacity, facilities and location.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Check availability</h3>
            <p>
              Choose your date and time, then check whether
              your preferred venue is available.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Request a booking</h3>
            <p>
              Submit your event details and track your booking
              request as it awaits a decision.
            </p>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
