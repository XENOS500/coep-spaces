// Photo serials come from venue-photos.md, not the order of venues.json.
const photoVenues = [
  [1, "NC 01", "Academic Complex Building, 1st Floor"],
  [2, "NC 02", "Academic Complex Building, 1st Floor"],
  [3, "NC 03", "Academic Complex Building, 1st Floor"],
  [4, "NC 04", "Academic Complex Building, 1st Floor"],
  [5, "NC 05", "Academic Complex Building, 2nd floor"],
  [6, "NC 06", "Academic Complex Building, 2nd floor"],
  [7, "NC 07", "Academic Complex Building, 2nd floor"],
  [8, "NC 08", "Academic Complex Building, 2nd floor"],
  [9, "Seminar Hall", "E&TC Extension Building, Ground Floor"],
  [15, "Seminar Hall I", "Department of Instrumentation and Control Engineering, Ground Floor"],
  [16, "Class Room", "Department of Instrumentation and Control Engineering, 2nd Floor"],
  [17, "Seminar Hall II", "Department of Instrumentation and Control Engineering, 2nd Floor"],
  [18, "basement (Fluid Lab)", "Applied Mech, basement (Fluid Lab)"],
  [19, "Class Room 1", "Applied Mech, First Floor"],
  [21, "Class Room No 1", "Applied Mech, Applied Mech"],
  [22, "Applied Mech Seminar Hall", "Applied Mech, Ground Floor"],
  [23, "Class Room No 22", "Applied Mech, 1st Floor"],
  [42, "Classroom Environment Lab", "Civil Engg Dept, 1st Floor (Environment Lab)"],
  [46, "1st floor (Geotech classroom)", "Civil Engg Dept, (Transportation & Geotech)"],
];

const normalize = value => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
const venueKey = (name, location) => JSON.stringify([normalize(name), normalize(location)]);
const serials = new Set(photoVenues.map(([serial]) => serial));
const serialByVenue = new Map(photoVenues.map(([serial, name, location]) => [venueKey(name, location), serial]));

export function getVenuePhotoSerial(venue) {
  if (venue.sourceSerial !== undefined && venue.sourceSerial !== null && venue.sourceSerial !== "") {
    const serial = Number(venue.sourceSerial);
    return serials.has(serial) ? serial : null;
  }
  return serialByVenue.get(venueKey(venue.name, venue.location || venue.building)) ?? null;
}

export function resolveVenuePhoto(venue, bundledPhotos) {
  const serial = getVenuePhotoSerial(venue);
  return bundledPhotos[`../assets/venues/venue-${serial}.png`] || venue.image || "";
}
