# Venue photos

The 19 supplied PNGs are kept unchanged. Their filename suffixes are catalog
source serials from the supplied venue-photos.md, not database IDs or positions
in server/src/seed/venues.json.

The mapping lives in src/services/venuePhotos.js. It uses sourceSerial when
available and otherwise matches the exact venue name and location (ignoring
case and repeated whitespace). The current 55-venue seed catalog has 19 matches.
Serials 42 and 46 intentionally differ from their positions in that seed file.

VenuePhoto renders these bundled photos on catalog cards and details pages.
Bundled photos take precedence over external image URLs. Other venues retain
their saved image URLs or the existing placeholder. Failed image loads also
show the placeholder. The original image field remains editable by admins;
bundled asset URLs are never written into the database.

Vite emits the photos into the frontend build. No database seed or private
Google/SharePoint login is needed. When adding a photo, add its venue identity
to the mapping and place venue-SERIAL.png in this folder, then rebuild.
