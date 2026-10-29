import { api } from "./api.js";

function mapVenue(venue) {
  return {
    ...venue,
    id: venue._id,
    building: venue.location,
    active: venue.isActive,
    type: venue.type || "Campus venue",
    facilities: venue.facilities || [],
    approverId: venue.approver?._id || venue.approver || "",
    approver: venue.approver?.name || "",
  };
}
export async function fetchVenues(signal) {
  return (await api("/venues", { signal })).venues.map(mapVenue);
}
export async function fetchVenue(id, signal) {
  return mapVenue((await api("/venues/" + encodeURIComponent(id), { signal })).venue);
}
export async function fetchAdminVenues(signal) {
  return (await api("/admin/venues", { signal })).venues.map(mapVenue);
}
export async function fetchAdminVenue(id, signal) {
  return mapVenue((await api("/admin/venues/" + encodeURIComponent(id), { signal })).venue);
}
export async function fetchApprovers(signal) {
  return (await api("/admin/approvers", { signal })).approvers;
}
export async function saveVenue(id, body) {
  const path = id ? "/admin/venues/" + id : "/admin/venues";
  return mapVenue((await api(path, { method: id ? "PATCH" : "POST", body })).venue);
}
export async function setVenueActive(id, isActive) {
  return saveVenue(id, { isActive });
}
export async function promoteApprover(email) {
  return api("/admin/approvers", { method: "POST", body: { email } });
}
