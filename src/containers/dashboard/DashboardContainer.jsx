import React, { useState } from "react";
import "./dashboard.css";
import Category from "../../components/category/Category";
import FlashCard from "../flashCards/FlashCard";

const DashboardContainer = ({ cat, onCat, onSubmit }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-wrapper">
      <header className="dash-header">
        <div className="dash-logo">K-box</div>
        <button className="dash-create-btn" onClick={() => setShowModal(true)}>
          Create
        </button>
      </header>

      <FlashCard />

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
          <Category />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
