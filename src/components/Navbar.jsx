export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#top" className="navbar__brand">Adil Hassan</a>
      <div className="navbar__links" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
}
