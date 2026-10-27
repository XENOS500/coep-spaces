
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-mark">C</span>

        <div>
          <strong>COEP Spaces</strong>
          <p>Campus spaces, made simpler.</p>
        </div>
      </div>

      <div className="footer-college">
        <strong>College of Engineering Pune</strong>
        <p>Shivajinagar, Pune, Maharashtra, India</p>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} COEP Spaces
      </p>
    </footer>
  )
}

export default Footer
