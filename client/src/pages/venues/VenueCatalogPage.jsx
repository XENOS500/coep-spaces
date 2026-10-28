
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

const venues = [
  {
    id: 'main-auditorium',
    name: 'Main Auditorium',
    type: 'Auditorium',
    building: 'Main Building',
    capacity: 300,
    facilities: ['Projector', 'Sound system', 'Stage'],
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'seminar-hall-1',
    name: 'Seminar Hall 1',
    type: 'Seminar Hall',
    building: 'Academic Complex',
    capacity: 100,
    facilities: ['Projector', 'Air conditioning'],
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'computer-lab-2',
    name: 'Computer Lab 2',
    type: 'Laboratory',
    building: 'Computer Science Department',
    capacity: 60,
    facilities: ['Computers', 'Wi-Fi', 'Projector'],
    image:
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'classroom-b204',
    name: 'Classroom B204',
    type: 'Classroom',
    building: 'Academic Complex',
    capacity: 70,
    facilities: ['Whiteboard', 'Projector'],
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'conference-room',
    name: 'Conference Room',
    type: 'Meeting Room',
    building: 'Administration Block',
    capacity: 20,
    facilities: ['Display screen', 'Video conferencing'],
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'open-lawn',
    name: 'Central Open Lawn',
    type: 'Open Space',
    building: 'Central Campus',
    capacity: 200,
    facilities: ['Outdoor seating', 'Open-air events'],
    image:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80',
  },
]

const venueTypes = [
  'All venues',
  ...new Set(venues.map((venue) => venue.type)),
]

function VenueCatalogPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All venues')

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.building.toLowerCase().includes(search.toLowerCase())

    const matchesType =
      selectedType === 'All venues' || venue.type === selectedType

    return matchesSearch && matchesType
  })

  return (
    <main className="catalog-page">
      <Navbar />

      <section className="catalog-heading">
        <p className="eyebrow">COEP / CAMPUS DIRECTORY</p>
        <h1>Find your <span>space.</span></h1>
        <p>
          A place for lectures, discussions, workshops and the
          ideas that bring people together.
        </p>
      </section>

      <section className="catalog-controls">
        <div className="catalog-search">
          <label htmlFor="venue-search">Search campus spaces</label>
          <input
            id="venue-search"
            type="search"
            placeholder="Search by venue or building..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="catalog-filter">
          <label htmlFor="venue-type">Venue type</label>
          <select
            id="venue-type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            {venueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="catalog-results">
        <div className="catalog-results-heading">
          <h2>Campus spaces</h2>
          <p>
            {filteredVenues.length}{' '}
            {filteredVenues.length === 1 ? 'venue' : 'venues'} found
          </p>
        </div>

        {filteredVenues.length > 0 ? (
          <div className="venue-grid">
            {filteredVenues.map((venue) => (
              <article className="venue-card" key={venue.id}>
                <img
                  className="venue-card-image"
                  src={venue.image}
                  alt={venue.name}
                  loading="lazy"
                />

                <div className="venue-card-body">
                  <div className="venue-card-meta">
                    <span>{venue.type}</span>
                    <span>Capacity {venue.capacity}</span>
                  </div>

                  <h3>{venue.name}</h3>
                  <p className="venue-location">{venue.building}</p>

                  <div className="venue-facilities">
                    {venue.facilities.slice(0, 3).map((facility) => (
                      <span key={facility}>{facility}</span>
                    ))}
                  </div>

                  <Link
                    className="venue-card-link"
                    to={`/venue/${venue.id}`}
                  >
                    View venue <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <h3>No venues found</h3>
            <p>Try another search term or select a different venue type.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedType('All venues')
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

export default VenueCatalogPage
