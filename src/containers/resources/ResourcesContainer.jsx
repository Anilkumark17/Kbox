import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./resource.css"; // Assuming you have a CSS file for styling
const Card = lazy(() => import("../../components/card/Card"));
const ResourcesContainer = () => {
  const [active, setActive] = useState("links");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (e) => {
    if (e.target.classList.contains('nav-menu')) {
      setIsMenuOpen(false);
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.classList.add('menu-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <div className="nav-header">
          <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
          <p className="nav-title">Categories</p>
        </div>
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
          <ul>
            <li>
              <p onClick={() => {
                navigate('/dashboard');
                setIsMenuOpen(false);
              }}>
                <i className="fas fa-home"></i>
                Home
              </p>
            </li>
            <li>
              <p
                onClick={() => {
                  setActive("links");
                  setIsMenuOpen(false);
                }}
                className={active === "links" ? "active" : ""}
              >
                <i className="fas fa-link"></i>
                Links
              </p>
            </li>
            <li>
              <p
                onClick={() => {
                  setActive("images");
                  setIsMenuOpen(false);
                }}
                className={active === "images" ? "active" : ""}
              >
                <i className="fas fa-image"></i>
                Images
              </p>
            </li>
            <li>
              <p
                onClick={() => {
                  setActive("audio");
                  setIsMenuOpen(false);
                }}
                className={active === "audio" ? "active" : ""}
              >
                <i className="fas fa-music"></i>
                Audio
              </p>
            </li>
          </ul>
        </nav>
      </header>

      <div className="main">
        {active === "links" && (
          <div className="links">
            <Card />
          </div>
        )}
        {active === "images" && (
          <div className="images">
            <h2>Images Section</h2>
            {/* Add your images-related content here */}
          </div>
        )}
        {active === "audio" && (
          <div className="audio">
            <h2>Audio Section</h2>
            {/* Add your audio-related content here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesContainer;
