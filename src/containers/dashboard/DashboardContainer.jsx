import React, { useState } from "react";
import "./dashboard.css";
import Category from "../../components/category/Category";
import FlashCard from "../flashCards/FlashCard";
import TeamSpacesList from "../../components/teamSpaces/TeamSpacesList";

const DashboardContainer = ({ cat, onCat, onSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <div className="dash-logo">K-box</div>
      </header>

      <FlashCard />

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Space
        </button>
        <button 
          className={`tab-btn ${activeTab === "teams" ? "active" : ""}`}
          onClick={() => setActiveTab("teams")}
        >
          Team Spaces
        </button>
      </div>

      <main className="dash-main">
        {showModal && (
          <div className="dash-modal-overlay">
            <div className="dash-modal-content">
              <button onClick={() => setShowModal(false)}>×</button>
              <form onSubmit={onSubmit}>
                <input
                  type="text"
                  value={cat}
                  onChange={onCat}
                  placeholder="Category name"
                  required
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <div className="dash-category-wrapper">
        <div className="category-dip">
          {activeTab === "personal" ? (
            <Category />
          ) : (
            <TeamSpacesList />
          )}
        </div>
      </div>

      {/* Floating Create Button - only show for personal space */}
      {activeTab === "personal" && (
        <button className="fab-button" onClick={() => setShowModal(true)}>
          +
        </button>
      )}
    </div>
  );
};

export default DashboardContainer;