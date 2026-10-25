import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import VenueCard from '../components/venues/VenueCard'

const CAMPUS_SLIDES = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Coep_main_building.jpg/1280px-Coep_main_building.jpg',
    caption: 'Main Heritage Building',
    sub: 'Victorian Gothic Heritage Complex &bull; Established 1854'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/COEP_Boat_Club.jpg/1280px-COEP_Boat_Club.jpg',
    caption: 'COEP Boat Club & Riverfront',
    sub: 'Historic Mula Riverfront Grounds & Regatta Lawns'
  },
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    caption: 'Academic Complex & Department Wings',
    sub: 'Lecture Halls, Technical Labs, and Departmental Seminar Rooms'
  }
]

export default function HomePage() {
  const navigate = useNavigate()
  const { venues, user, isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const totalVenues = venues.length
  const featuredVenues = venues.slice(0, 4)

  return (
    <div className="home-container">
      {/* Institutional Hero Banner */}
      <section className="hero-section">
        {/* Carousel Background */}
        <div className="hero-carousel-bg">
          {CAMPUS_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`hero-carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.url})` }}
            >
              <div className="hero-dark-overlay" />
            </div>
          ))}
        </div>

        <div className="container hero-content-wrap">
          <div className="hero-inner">
            <span className="hero-eyebrow">
              COEP TECHNOLOGICAL UNIVERSITY &bull; ESTABLISHED 1854
            </span>
            <h1 className="hero-title">
              Campus Venue Reservation & Allocation System
            </h1>
            <p className="hero-description">
              Official institutional platform for browsing campus facilities, verifying real-time schedule availability, and submitting booking requisitions across academic departments.
            </p>

            <div className="hero-cta-row">
              <Link to="/venues" className="btn-primary">
                Browse Venue Catalog
              </Link>
              <Link to="/availability" className="btn-secondary-on-dark">
                Check Availability & Conflicts
              </Link>
              <Link to="/calendar" className="btn-secondary-on-dark">
                Master Schedule Calendar
              </Link>
            </div>

            {/* Operational Framework Summary */}
            <div className="hero-metrics-grid">
              <div className="hero-metric-item">
                <span className="metric-val">{totalVenues} Facilities</span>
                <span className="metric-lbl">Audited Catalog Records</span>
              </div>
              <div className="hero-metric-item">
                <span className="metric-val">30-Day Window</span>
                <span className="metric-lbl">Advance Booking Horizon</span>
              </div>
              <div className="hero-metric-item">
                <span className="metric-val">Strict Verification</span>
                <span className="metric-lbl">Assigned Approver Sanction</span>
              </div>
              <div className="hero-metric-item">
                <span className="metric-val">Asia/Kolkata</span>
                <span className="metric-lbl">Operational Timezone</span>
              </div>
            </div>
          </div>

          <div className="hero-slide-caption-bar">
            <span>{CAMPUS_SLIDES[currentSlide].caption}</span> &bull;{' '}
            <span className="caption-subtext" dangerouslySetInnerHTML={{ __html: CAMPUS_SLIDES[currentSlide].sub }} />
          </div>
        </div>
      </section>

      {/* Campus Divisions Section */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">CAMPUS INFRASTRUCTURE</span>
            <h2 className="section-heading">COEP Campus Divisions</h2>
            <p className="section-subheading">
              Facilities are distributed across historic North Campus and modern South Campus complexes, connected by the central pedestrian flyover.
            </p>
          </div>

          <div className="campus-split-grid">
            {/* North Campus */}
            <div className="campus-division-card">
              <div className="division-image-wrap">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Coep_main_building.jpg/1280px-Coep_main_building.jpg"
                  alt="North Campus Heritage Main Building"
                />
                <span className="division-tag">North Division &bull; Heritage</span>
              </div>
              <div className="division-content">
                <h3 className="division-title">North Campus (Main Heritage Grounds)</h3>
                <p className="division-desc">
                  Houses the Victorian Gothic Main Building, B.J. Hall Main Auditorium, Senate Hall, historic Mula River Boat Club lawns, and Open Air Theatre (OAT).
                </p>
                <ul className="division-specs">
                  <li>&bull; Main Auditorium (B.J. Hall) &bull; 500 Capacity</li>
                  <li>&bull; Senate Hall & Council Chambers &bull; 65 Capacity</li>
                  <li>&bull; Open Air Theatre (OAT) &bull; 350 Capacity</li>
                  <li>&bull; Boat Club Riverside Lawns &bull; 250 Capacity</li>
                </ul>
                <Link to="/venues" className="btn-secondary btn-block">
                  Explore North Campus Venues &rarr;
                </Link>
              </div>
            </div>

            {/* South Campus */}
            <div className="campus-division-card">
              <div className="division-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80"
                  alt="South Campus Academic Complex"
                />
                <span className="division-tag">South Division &bull; Academic Complex</span>
              </div>
              <div className="division-content">
                <h3 className="division-title">South Campus (Academic Complex)</h3>
                <p className="division-desc">
                  Features state-of-the-art department facilities for Computer Engineering & IT, Electrical, E&TC, Mini Auditoriums, and advanced research laboratories.
                </p>
                <ul className="division-specs">
                  <li>&bull; Mini Auditoriums AC-1 & AC-2 &bull; 150 Capacity</li>
                  <li>&bull; Classrooms NC 01 to NC 08 &bull; 70-72 Capacity</li>
                  <li>&bull; High-Performance Programming Labs &bull; 60 Capacity</li>
                  <li>&bull; Innovation & Incubation Maker Studio &bull; 50 Capacity</li>
                </ul>
                <Link to="/venues" className="btn-secondary btn-block">
                  Explore South Campus Venues &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Roles & Governance */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">SYSTEM GOVERNANCE</span>
            <h2 className="section-heading">Roles & Permissions Structure</h2>
            <p className="section-subheading">
              Each user account possesses exactly one role. Permissions are strictly segmented to enforce institutional auditability.
            </p>
          </div>

          <div className="roles-spec-grid">
            <div className="role-spec-card">
              <div className="role-spec-header">
                <span className="role-badge role-requester">REQUESTER</span>
                <h3 className="role-spec-title">Requisition Submissions</h3>
              </div>
              <p className="role-spec-desc">
                Faculty coordinators and registered student society leads. Can check schedule availability, compute recurring occurrences, submit requisitions, and cancel own eligible bookings before session commencement.
              </p>
              <div className="role-spec-nav">
                <span>Accessible Navigation:</span>
                <code>New Booking &bull; My Bookings</code>
              </div>
            </div>

            <div className="role-spec-card">
              <div className="role-spec-header">
                <span className="role-badge role-approver">APPROVER</span>
                <h3 className="role-spec-title">Delegated Venue Clearance</h3>
              </div>
              <p className="role-spec-desc">
                Designated faculty and facility heads assigned to specific venues. Authorized to review full requisition details and grant official approval or rejection with mandatory recorded reasons. Cannot submit personal bookings.
              </p>
              <div className="role-spec-nav">
                <span>Accessible Navigation:</span>
                <code>Pending Requests &bull; Approval History</code>
              </div>
            </div>

            <div className="role-spec-card">
              <div className="role-spec-header">
                <span className="role-badge role-admin">ADMIN</span>
                <h3 className="role-spec-title">Estate & Facility Administration</h3>
              </div>
              <p className="role-spec-desc">
                Estate and administration staff. Maintain audited venue records, configure operating hours and verified capacities, and assign/remove venue approvers. Receives no booking decision or requester cancellation powers.
              </p>
              <div className="role-spec-nav">
                <span>Accessible Navigation:</span>
                <code>Manage Venues &bull; Assign Approvers</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venues Preview */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">FACILITIES DIRECTORY</span>
              <h2 className="section-heading">Sample Featured Venues</h2>
              <p className="section-subheading">
                Preview of institutional facilities with verified capacities and active booking configurations.
              </p>
            </div>

            <Link to="/venues" className="btn-secondary">
              View All {totalVenues} Venues &rarr;
            </Link>
          </div>

          <div className="venue-card-grid">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
