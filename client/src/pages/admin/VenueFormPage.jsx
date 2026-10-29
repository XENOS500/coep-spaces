
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { fetchApprovers, fetchAdminVenue, saveVenue } from "../../services/venueApi.js";

const emptyVenue = {
  name: "",
  type: "Campus venue",
  capacity: "",
  building: "",
  floor: "",
  room: "",
  image: "",
  approver: "",
  facilities: "",
};

function VenueFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({ ...emptyVenue });
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true); setLoadError(""); setError("");
        const [people, venue] = await Promise.all([
          fetchApprovers(controller.signal),
          id ? fetchAdminVenue(id, controller.signal) : Promise.resolve(null),
        ]);
        if (!controller.signal.aborted) {
          setApprovers(people);
          setFormData(venue ? {
            ...emptyVenue, ...venue, approver: venue.approverId,
            facilities: venue.facilities.join(", "),
          } : { ...emptyVenue });
        }
      } catch (err) { if (!controller.signal.aborted) setLoadError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    const capacity = Number(formData.capacity);
    if (!formData.name.trim() || !formData.building.trim() || !Number.isInteger(capacity) || capacity < 1) {
      setError("Enter a name, location and positive whole-number capacity.");
      return;
    }
    setSaving(true);
    try {
      await saveVenue(id, {
        name: formData.name.trim(), location: formData.building.trim(), capacity,
        type: formData.type, floor: formData.floor.trim(), room: formData.room.trim(),
        image: formData.image.trim(), approver: formData.approver || null,
        facilities: formData.facilities.split(",").map(item => item.trim()).filter(Boolean),
      });
      navigate("/admin/venues");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading || loadError) {
    return <main className="venue-form-page"><Navbar /><section className="venue-form-card">
      {loading ? <p role="status">Loading venue details...</p> : <p role="alert">{loadError}</p>}
      <Link to="/admin/venues">Back to venues</Link>
    </section><Footer /></main>;
  }

  return (
    <main className="venue-form-page">
      <Navbar />

      <div className="venue-form-heading">
        <div>
          <p className="eyebrow">COEP SPACES / ADMIN</p>
          <h1>{isEditing ? "Edit venue" : "Add a venue"}</h1>
          <p className="form-intro">
            {isEditing
              ? "Update venue details or change its assigned Approver."
              : "Add a campus space and assign the person responsible for approvals."}
          </p>
        </div>

        <Link className="text-link" to="/admin/venues">
          ← Back to venues
        </Link>
      </div>

      <form className="venue-form-card" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <span className="form-section-number">01</span>
          <div>
            <h2>Venue details</h2>
            <p>Basic information about the space.</p>
          </div>
        </div>

        <div className="venue-form-grid">
          <label className="form-field full-width">
            Venue name *
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Seminar Hall B"
              required
            />
          </label>

          <label className="form-field">
            Venue type *
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Campus venue">Campus venue</option>
              <option value="Classroom">Classroom</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Sports Facility">Sports Facility</option>
            </select>
          </label>

          <label className="form-field">
            Capacity *
            <input
              name="capacity"
              type="number"
              min="1"
              step="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 100"
              required
            />
          </label>

          <label className="form-field">
            Location / building *
            <input
              name="building"
              value={formData.building}
              onChange={handleChange}
              placeholder="Building name"
              required
            />
          </label>

          <label className="form-field">
            Floor
            <input
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              placeholder="e.g. First Floor"
            />
          </label>

          <label className="form-field">
            Room number / name
            <input
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="e.g. A-101"
            />
          </label>

          <label className="form-field">
            Image URL
            <input
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/venue.jpg"
            />
          </label>
        </div>

        <div className="form-section-heading second-form-section">
          <span className="form-section-number">02</span>
          <div>
            <h2>Approval</h2>
            <p>Choose the person responsible for approving requests.</p>
          </div>
        </div>

        <label className="form-field">
          Assigned approver
          <select
            name="approver"
            value={formData.approver}
            onChange={handleChange}
          >
            <option value="">Not assigned</option>
            {approvers.map((approver) => (
              <option key={approver._id} value={approver._id}>
                {approver.name} ({approver.email})
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">Facilities (comma-separated)
          <input name="facilities" value={formData.facilities} onChange={handleChange} placeholder="Projector, WiFi, Microphone" />
        </label>
        <p>Bookings for unassigned venues remain pending until an administrator assigns an approver.</p>
        {error && (
          <p className="venue-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="venue-form-actions">
          <Link className="secondary-button" to="/admin/venues">
            Cancel
          </Link>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save changes" : "Add venue"}
          </button>
        </div>

      </form>

      <Footer />
    </main>
  );
}

export default VenueFormPage;
