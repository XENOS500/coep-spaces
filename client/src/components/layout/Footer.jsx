import Brand from "../Brand.jsx";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
                <div>
          <Brand />
          <p>Campus spaces, made simpler.</p>
        </div>
      </div>

      <div className="footer-college">
        <strong>College of Engineering Pune</strong>
        <p>Shivajinagar, Pune, Maharashtra, India</p>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} COEP Spaces
        <br />
        <a href="/privacy.html">Privacy Policy</a>{" · "}
        <a href="/terms.html">Terms and Conditions</a>
      </p>
    </footer>
  )
}

export default Footer
