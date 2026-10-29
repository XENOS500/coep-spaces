
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer.jsx";
import { fetchAdminVenues, setVenueActive, promoteApprover } from "../../services/venueApi.js";

function ManageVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [approverEmail, setApproverEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await fetchAdminVenues(controller.signal);
        if (!controller.signal.aborted) { setVenues(result); setError(""); }
      } catch (err) { if (!controller.signal.aborted) setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    window.addEventListener("focus", load);
    return () => { controller.abort(); window.removeEventListener("focus", load); };
  }, []);

  async function handlePromote(event) {
    event.preventDefault();
    if (promoting) return;
    setPromoting(true); setError(""); setMessage("");
    try {
      const result = await promoteApprover(approverEmail);
      setMessage(result.user.name + " can now be assigned to venues as an approver.");
      setApproverEmail("");
    } catch (err) { setError(err.message); }
    finally { setPromoting(false); }
  }

  const filteredVenues = venues.filter((venue) => {
    if (filter === "ACTIVE") return venue.active;
    if (filter === "INACTIVE") return !venue.active;
    return true;
  });

  async function handleDeactivate() {
    if (!selectedVenue || saving) return;
    setSaving(true); setError("");
    try {
      const updated = await setVenueActive(selectedVenue.id, !selectedVenue.active);
      setVenues(current => current.map(venue => venue.id === updated.id ? updated : venue));
      setSelectedVenue(null);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="manage-venues-page">


      <section className="manage-venues-heading">
        <p className="eyebrow">COEP / ADMINISTRATION</p>
        <h1>
          Manage <span>venues.</span>
        </h1>
        <p>
          Maintain campus spaces, update venue information, assign
          approvers and control which venues are available for booking.
        </p>
      </section>

      <section className="manage-venues-content">
        {loading && <p role="status">Loading venues...</p>}
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <form className="venue-form-card" onSubmit={handlePromote}>
          <h2>Add an approver</h2>
          <p>Enter an existing user's registered email, then assign them to a venue when editing it.</p>
          <label className="form-field">Email address
            <input type="email" required value={approverEmail} onChange={event => setApproverEmail(event.target.value)} />
          </label>
          <button className="primary-button" disabled={promoting} type="submit">{promoting ? "Saving..." : "Add approver"}</button>
        </form>
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

          <Link to="/admin/venues/new" className="venue-add-button">
            + Add venue
          </Link>
        </div>

        <div className="venue-admin-filters">
          {["ALL", "ACTIVE", "INACTIVE"].map((option) => (
            <button
              key={option}
              type="button"
              className={
                filter === option
                  ? "venue-admin-filter active"
                  : "venue-admin-filter"
              }
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
            >
              {option === "ALL"
                ? "All venues"
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

                  <td>
                    <div className="venue-assigned-approver">
                      <strong>
                        {venue.approver || "Not assigned"}
                      </strong>

                      <Link
                        to={`/admin/venues/${venue.id}/edit`}
                        className="venue-approver-link"
                        aria-label={`Change approver for ${venue.name}`}
                      >
                        {venue.approver ? "Change approver" : "Assign approver"}
                      </Link>
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        venue.active
                          ? "venue-admin-status active"
                          : "venue-admin-status inactive"
                      }
                    >
                      {venue.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="venue-admin-actions">
                      <Link
                        to={`/admin/venues/${venue.id}/edit`}
                        className="venue-edit-link"
                      >
                        Edit details
                      </Link>

                      {(
                        <button
                          type="button"
                          className="venue-deactivate-button"
                          onClick={() => setSelectedVenue(venue)}
                        >
                          {venue.active ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !error && filteredVenues.length === 0 && (
                <tr>
                  <td colSpan={6} className="venue-admin-empty">
                    No venues match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

      <Footer />

      {selectedVenue && (
        <div
          className="venue-dialog-backdrop"
          onClick={() => { if (!saving) setSelectedVenue(null); }}
        >
          <section
            className="venue-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="venue-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">ADMIN ACTION</p>

            <h2 id="venue-dialog-title">{selectedVenue.active ? "Deactivate" : "Reactivate"} this venue?</h2>

            <p>
              <strong>{selectedVenue.name}</strong> will be {selectedVenue.active ? "hidden from new booking requests" : "available for new booking requests"}. Existing bookings are preserved.
            </p>

            {error && <p role="alert">{error}</p>}
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
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ManageVenuesPage;
