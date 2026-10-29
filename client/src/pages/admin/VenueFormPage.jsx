
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/layout/Footer.jsx";
import {
  getVenues,
  saveVenues,
  DEMO_APPROVERS,
} from "../../data/demoStore.js";

const emptyVenue = {
  name: "",
  type: "Classroom",
  capacity: "",
  building: "",
  floor: "",
  room: "",
  image: "",
  approver: "",
};

function VenueFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [existingVenue] = useState(() =>
    isEditing ? getVenues().find((venue) => venue.id === id) : null
  );

  const [formData, setFormData] = useState(() =>
    existingVenue
      ? { ...emptyVenue, ...existingVenue }
      : { ...emptyVenue }
  );

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const building = formData.building.trim();
    const room = formData.room.trim();
    const capacity = Number(formData.capacity);

    if (
      !name ||
      !building ||
      !room ||
      !formData.capacity ||
      !formData.approver
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    if (!DEMO_APPROVERS.includes(formData.approver)) {
      setError("Please select a valid approver.");
      return;
    }

    const currentVenues = getVenues();

    const updatedFields = {
      ...formData,
      name,
      building,
      room,
      capacity,
      floor: formData.floor.trim(),
      image: formData.image.trim(),
      approver: formData.approver,
    };

    let updatedVenues;

    if (isEditing) {
      const venueExists = currentVenues.some(
        (venue) => venue.id === id
      );

      if (!venueExists) {
        setError("This venue no longer exists. Return to venue management.");
        return;
      }

      updatedVenues = currentVenues.map((venue) =>
        venue.id === id
          ? { ...venue, ...updatedFields, id: venue.id }
          : venue
      );
    } else {
      const newVenue = {
        ...updatedFields,
        id: `venue-${Date.now()}`,
        active: true,
      };

      updatedVenues = [...currentVenues, newVenue];
    }

    try {
      saveVenues(updatedVenues);

      // Notify pages currently open in this tab that shared data changed.
      window.dispatchEvent(new Event("coep-demo-data-changed"));

      navigate("/admin/venues");
    } catch {
      setError("Could not save the venue in this browser. Please try again.");
    }
  }

  if (isEditing && !existingVenue) {
    return (
      <main className="venue-form-page">
        <Navbar />
        <section className="venue-form-card">
          <p className="eyebrow">COEP SPACES / ADMIN</p>
          <h1>Venue not found</h1>
          <p className="form-intro">
            This demo venue could not be found. Return to venue management
            and choose a venue to edit.
          </p>
          <Link className="primary-button form-back-link" to="/admin/venues">
            Back to venues
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="venue-form-page">
   

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
            Building *
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
            Room number / name *
            <input
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="e.g. A-101"
              required
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
          Assigned approver *
          <select
            name="approver"
            value={formData.approver}
            onChange={handleChange}
            required
          >
            <option value="">Select an approver</option>
            {DEMO_APPROVERS.map((approver) => (
              <option key={approver} value={approver}>
                {approver}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="venue-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="venue-form-actions">
          <Link className="secondary-button" to="/admin/venues">
            Cancel
          </Link>
          <button className="primary-button" type="submit">
            {isEditing ? "Save changes" : "Add venue"}
          </button>
        </div>

        <p className="demo-note">
          Demo mode: venue details and assignments are saved in this
          browser, not on the backend server.
        </p>
      </form>

      <Footer />
    </main>
  );
}

export default VenueFormPage;
