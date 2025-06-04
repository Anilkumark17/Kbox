import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./resource.css";
const Card = lazy(() => import("../../components/card/Card"));
import Notes from "../../components/notes/Notes";
import { supabase } from "../../utils/db";

const ResourcesContainer = () => {
  const [active, setActive] = useState("links");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [category, setCategoryName] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    const fetchCatName = async () => {
      const { data: categoryName } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();
      setCategoryName(categoryName?.name);
    };
    fetchCatName();
  }, [id]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (e) => {
    if (e.target.classList.contains("nav-menu")) {
      setIsMenuOpen(false);
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      document.body.classList.add("menu-open");
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <div className="nav-header">
        
          <p className="nav-title">Categories</p>

            <button
            className="hamburger-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
          </button>
        </div>
        <nav
          className={`nav-menu ${isMenuOpen ? "open" : ""}`}
          onClick={handleMenuClick}
        >
          <ul>
            <li>
              <p
                onClick={() => {
                  navigate("/dashboard");
                  setIsMenuOpen(false);
                }}
              >
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
                  setActive("notes");
                  setIsMenuOpen(false);
                }}
                className={active === "notes" ? "active" : ""}
              >
                <i className="fas fa-music"></i>
                Notes
              </p>
            </li>
          </ul>
        </nav>
      </header>

      <div className="main">
        {active === "links" && (
          <div className="links">
            <Card category={category} />
          </div>
        )}
        {active === "images" && <div className="images">{/* <Pic/> */}</div>}
        {active === "notes" && (
          <div className="notes">
            <Notes category={category} id={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesContainer;
