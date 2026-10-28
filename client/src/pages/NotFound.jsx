
function NotFound() {
  return (
    <main className="not-found-page">
      <p className="not-found-code">ERROR 404</p>

      <h1>Looks like a wrong turn.</h1>

      <p>
        The page you're looking for doesn't exist
        or may have been moved.
      </p>

      <a className="not-found-button" href="/">
        Return to homepage
      </a>
    </main>
  )
}

export default NotFound
