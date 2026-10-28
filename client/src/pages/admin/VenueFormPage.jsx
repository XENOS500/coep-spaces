
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const mockVenues = [
  {
    id: "1",
    name: "Main Auditorium",
    type: "Auditorium",
    capacity: 500,
    building: "Main Building",
    floor: "Ground Floor",
    room: "Auditorium",
    image: "",
    approver: "Prof. Sharma",
  },
  {
    id: "2",
    name: "Seminar Hall A",
    type: "Seminar Hall",
    capacity: 120,
    building: "Academic Complex",
    floor: "First Floor",
    room: "A-101",
    image: "",
    approver: "Prof. Patil",
  },
];

const approvers = ["Prof. Sharma", "Prof. Patil", "Prof. Deshmukh"];

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

  const existingVenue = mockVenues.find((venue) => venue.id === id);

  const [formData, setFormData] = useState(
    isEditing && existingVenue ? existingVenue : emptyVenue
  );
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.building.trim() ||
      !formData.room.trim() ||
      !formData.capacity ||
      !formData.approver
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (Number(formData.capacity) < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    // Demo only: the venue is not saved to the backend yet.
    console.log(
      isEditing ? "Demo venue update:" : "Demo new venue:",
      formData
    );

    window.alert(
      isEditing
        ? "Demo: venue details validated."
        : "Demo: new venue details validated."
    );

    navigate("/admin/venues");
  }

  if (isEditing && !existingVenue) {
    return (
      <main className="venue-form-page">
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
              ? "Update the details people see when booking this space."
              : "Add a campus space to make it available for booking."}
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
            {approvers.map((approver) => (
              <option key={approver} value={approver}>
                {approver}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="venue-form-error">{error}</p>}

        <div className="venue-form-actions">
          <Link className="secondary-button" to="/admin/venues">
            Cancel
          </Link>
          <button className="primary-button" type="submit">
            {isEditing ? "Save changes" : "Add venue"}
          </button>
        </div>

        <p className="demo-note">
          Demo mode: this form validates your input but does not yet save
          changes to the server.
        </p>
      </form>
    </main>
  );
}

export default VenueFormPage;
