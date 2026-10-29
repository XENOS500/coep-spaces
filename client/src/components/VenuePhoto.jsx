import { useState } from "react";
import { resolveVenuePhoto } from "../services/venuePhotos.js";

// Vite includes these files in the build and supplies public, hashed asset URLs.
const bundledPhotos = import.meta.glob("../assets/venues/venue-*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export default function VenuePhoto({ venue, className = "", placeholderClassName = "", loading }) {
  const source = resolveVenuePhoto(venue, bundledPhotos);
  const [failedSource, setFailedSource] = useState(null);

  if (!source || failedSource === source) {
    return (
      <div className={`${className} venue-photo-placeholder ${placeholderClassName}`} aria-label="No venue photo available">
        Photo not added
      </div>
    );
  }

  return <img className={className} src={source} alt={venue.name} loading={loading} onError={() => setFailedSource(source)} />;
}
