
function Navbar() {
  return (
    <header className="navbar">
      <a className="brand" href="/" aria-label="COEP Spaces home">
        <span className="brand-mark">C</span>
        <span>COEP Spaces</span>
      </a>

      <nav className="nav-actions" aria-label="Main navigation">
        <a className="login-link" href="/login">
          Login
        </a>

        <a className="register-button" href="/register">
          Register
        </a>
      </nav>
    </header>
  )
}

export default Navbar
