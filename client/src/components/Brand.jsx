import emblem from "../assets/coep-emblem.png";

export default function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-name">COEP Spaces</span>
      <img className="coep-emblem" src={emblem} alt="" aria-hidden="true" width="48" height="48" />
    </span>
  );
}
