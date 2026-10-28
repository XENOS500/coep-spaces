
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

// Temporary venue records for the frontend demonstration.
const initialVenues = [
  {
    id: 'venue-1',
    name: 'Main Auditorium',
    type: 'Auditorium',
    building: 'Main Building',
    room: 'Auditorium A',
    capacity: 500,
    approver: 'Dr. Kulkarni',
    active: true,
  },
  {
    id: 'venue-2',
    name: 'Seminar Hall 1',
    type: 'Seminar Hall',
    building: 'Academic Block',
    room: 'First Floor',
    capacity: 100,
    approver: 'Prof. Deshmukh',
    active: true,
  },
  {
    id: 'venue-3',
    name: 'Classroom B204',
    type: 'Classroom',
    building: 'Engineering Block B',
    room: 'Room 204',
    capacity: 60,
    approver: 'Dr. Patil',
    active: false,
  },
]

function ManageVenuesPage() {
  const [venues, setVenues] = useState(initialVenues)
  const [filter, setFilter] = useState('ALL')
  const [selectedVenue, setSelectedVenue] = useState(null)

  const filteredVenues = venues.filter((venue) => {
    if (filter === 'ACTIVE') return venue.active
    if (filter === 'INACTIVE') return !venue.active
    return true
  })

  function handleDeactivate() {
    setVenues((currentVenues) =>
      currentVenues.map((venue) =>
        venue.id === selectedVenue.id
          ? { ...venue, active: false }
          : venue
      )
    )

    setSelectedVenue(null)
  }

  return (
    <main className="manage-venues-page">
      <Navbar />

      <section className="manage-venues-heading">
        <p className="eyebrow">COEP / ADMINISTRATION</p>
        <h1>Manage <span>venues.</span></h1>
        <p>
          Maintain campus spaces, update venue information and
          control which venues are available for booking.
        </p>
      </section>

      <section className="manage-venues-content">
        <div className="venue-admin-summary">
          <div>
            <span>TOTAL VENUES</span>
            <strong>{venues.length}</strong>
          </div>

          <div>
            <span>ACTIVE</span>
            <strong>{venues.filter((venue) => venue.active).length}</strong>
          </div>

          <div>
            <span>INACTIVE</span>
            <strong>{venues.filter((venue) => !venue.active).length}</strong>
          </div>
        </div>

        <div className="venue-admin-toolbar">
          <div>
            <h2>Campus venues</h2>
            <p>Review and manage registered spaces.</p>
          </div>

          <Link
            to="/admin/venues/new"
            className="venue-add-button"
          >
            + Add venue
          </Link>
        </div>

        <div className="venue-admin-filters">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((option) => (
            <button
              key={option}
              type="button"
              className={
                filter === option
                  ? 'venue-admin-filter active'
                  : 'venue-admin-filter'
              }
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
            >
              {option === 'ALL'
                ? 'All venues'
                : option.charAt(0) + option.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="venue-admin-table-wrapper">
          <table className="venue-admin-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Assigned approver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVenues.map((venue) => (
                <tr key={venue.id}>
                  <td>
                    <strong>{venue.name}</strong>
                    <span className="venue-admin-secondary">
                      {venue.type}
                    </span>
                  </td>

                  <td>
                    <strong>{venue.building}</strong>
                    <span className="venue-admin-secondary">
                      {venue.room}
                    </span>
                  </td>

                  <td>{venue.capacity} people</td>

                  <td>{venue.approver}</td>

                  <td>
                    <span
                      className={
                        venue.active
                          ? 'venue-admin-status active'
                          : 'venue-admin-status inactive'
                      }
                    >
                      {venue.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="venue-admin-actions">
                      <Link
                        to={`/admin/venues/${venue.id}/edit`}
                        className="venue-edit-link"
                      >
                        Edit
                      </Link>

                      {venue.active && (
                        <button
                          type="button"
                          className="venue-deactivate-button"
                          onClick={() => setSelectedVenue(venue)}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVenues.length === 0 && (
                <tr>
                  <td colSpan="6" className="venue-admin-empty">
                    No venues match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="venue-admin-note">
          Demonstration data only. Changes will persist across sessions
          once the venue API is connected.
        </p>
      </section>

      <Footer />

      {selectedVenue && (
        <div
          className="venue-dialog-backdrop"
          onClick={() => setSelectedVenue(null)}
        >
          <section
            className="venue-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="venue-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">ADMIN ACTION</p>

            <h2 id="venue-dialog-title">Deactivate this venue?</h2>

            <p>
              <strong>{selectedVenue.name}</strong> will be marked inactive.
              It will remain in the admin list, but should no longer be
              offered for new bookings once the backend is connected.
            </p>

            <div className="venue-dialog-actions">
              <button
                type="button"
                className="venue-cancel-button"
                onClick={() => setSelectedVenue(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="venue-confirm-button"
                onClick={handleDeactivate}
              >
                Confirm deactivation
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default ManageVenuesPage
