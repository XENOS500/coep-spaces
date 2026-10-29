
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer.jsx'
import { fetchVenues } from '../../services/venueApi.js'

function VenueCatalogPage() {
  const [allVenues, setAllVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All venues')

  useEffect(() => {
    const controller = new AbortController()

    async function loadVenues() {
      try {
        setLoading(true)
        setError('')
        const venues = await fetchVenues(controller.signal)
        if (!controller.signal.aborted) setAllVenues(venues)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadVenues()
    return () => controller.abort()
  }, [])

  const venueTypes = [
    'All venues',
    ...new Set(allVenues.map((venue) => venue.type)),
  ]

  const filteredVenues = allVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.building.toLowerCase().includes(search.toLowerCase())

    const matchesType =
      selectedType === 'All venues' || venue.type === selectedType

    return matchesSearch && matchesType
  })

  if (loading || error) {
    return (
      <main className="catalog-page">

        <section className="catalog-results" aria-live="polite">
          {loading ? <p>Loading venues...</p> : <p role="alert">{error}</p>}
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="catalog-page">


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
                {venue.image ? <img
                  className="venue-card-image"
                  src={venue.image}
                  alt={venue.name}
                  loading="lazy"
                /> : <div className="venue-card-image venue-photo-placeholder" aria-label="No venue photo available">Photo not added</div>}

                <div className="venue-card-body">
                  <div className="venue-card-meta">
                    <span>{venue.type}</span>
                    <span>Capacity {venue.capacity}</span>
                  </div>

                  <h3>{venue.name}</h3>
                  <p className="venue-location">{venue.building}</p>

                  {venue.facilities && venue.facilities.length > 0 && (
                    <div className="venue-facilities">
                      {venue.facilities.slice(0, 3).map((facility) => (
                        <span key={facility}>{facility}</span>
                      ))}
                    </div>
                  )}

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
