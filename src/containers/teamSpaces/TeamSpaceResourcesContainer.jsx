import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamSpaceById } from "../../api/TeamSpaceApi";
import "./teamSpaceResources.css";

const TeamSpaceCard = lazy(() => import("../../components/teamSpaces/TeamSpaceCard"));
const TeamSpaceNotes = lazy(() => import("../../components/teamSpaces/TeamSpaceNotes"));

const TeamSpaceResourcesContainer = () => {
  const [active, setActive] = useState("links");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teamSpace, setTeamSpace] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const navigate = useNavigate();
  const { spaceId, categoryId } = useParams();

  useEffect(() => {
    fetchTeamSpaceData();
  }, [spaceId, categoryId]);

  const fetchTeamSpaceData = async () => {
    try {
      const spaceData = await getTeamSpaceById(spaceId);
      setTeamSpace(spaceData);

      // Fetch category name
      const { data: categoryData } = await supabase
        .from("team_space_categories")
        .select("name")
        .eq("id", categoryId)
        .single();
      
      setCategoryName(categoryData?.name || "Unknown Category");
    } catch (error) {
      console.error("Error fetching team space data:", error);
      navigate("/dashboard");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (e) => {
    if (e.target.classList.contains("nav-menu")) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.classList.add("menu-open");
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <div className="nav-header">
          <p className="nav-title">{teamSpace?.name || "Team Space"}</p>
          <button
            className="hamburger-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
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
                  navigate(`/space/${spaceId}`);
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-home"></i>
                Back to Space
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
                  setActive("notes");
                  setIsMenuOpen(false);
                }}
                className={active === "notes" ? "active" : ""}
              >
                <i className="fas fa-sticky-note"></i>
                Notes
              </p>
            </li>
          </ul>
        </nav>
      </header>

      <div className="main">
        <h2 className="category-title">{categoryName}</h2>
        
        {active === "links" && (
          <div className="links">
            <Suspense fallback={<div>Loading links...</div>}>
              <TeamSpaceCard 
                spaceId={spaceId} 
                categoryId={categoryId}
                categoryName={categoryName}
              />
            </Suspense>
          </div>
        )}
        
        {active === "notes" && (
          <div className="notes">
            <Suspense fallback={<div>Loading notes...</div>}>
              <TeamSpaceNotes 
                spaceId={spaceId}
                categoryId={categoryId}
                categoryName={categoryName}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSpaceResourcesContainer;