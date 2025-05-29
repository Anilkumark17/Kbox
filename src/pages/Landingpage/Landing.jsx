// src/pages/Landing.jsx
import React from "react";
import "./landing.css";
import { useNavigate } from "react-router-dom";
import hero from "../../assets/hero.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-body">
      <header>
        <div className="title">KBox</div>
        <div className="buttons">
          <button className="login-btn" onClick={() => navigate("/auth")}>Join with us</button>
        </div>
      </header>

      <main className="landing-main">
        <div className="content">
          <div className="content-text">
            <h1 className="main-text">
              Your <span>Personal Space</span> for Everything Important
            </h1>
            <p className="sub-text">
              Keep every important link, note, and file at your fingertips — private, searchable, and beautifully organized.
            </p>
          </div>
          <div className="content-img">
            <img src={hero} alt="Illustration" className="hero-img" />
          </div>
        </div>

        {/* Problem Section */}
        <section className="section section-glass problem-section">
          <h2>The Chaos of Modern Digital Life</h2>
          <p>
            We're drowning in browser tabs, messy folders, scattered notes, and apps that never sync. Important ideas fade away, lost in the noise.
          </p>
        </section>

        {/* Vision Section */}
        <section className="section section-gradient vision-section">
          <h2>Our Vision</h2>
          <p>
            To build a digital sanctuary — your second brain — where every meaningful thought, link, and file lives safely, and is always within reach.
          </p>
        </section>

        {/* Solution Section */}
        <section className="section section-cards solution-section">
          <h2>What KBox Does</h2>
          <div className="solution-cards">
            <div className="solution-card">
              <h3>🧠 Save Anything</h3>
              <p>Links, notes, PDFs, images, videos, audio — all neatly categorized and instantly accessible.</p>
            </div>
            <div className="solution-card">
              <h3>🔍 Find Fast</h3>
              <p>Smart search and filters help you recall anything — even from years ago — in seconds.</p>
            </div>
            <div className="solution-card">
              <h3>🔒 Private by Default</h3>
              <p>Everything stays private unless you choose to share. Your data, your control.</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <h3>Anil</h3>
              <p>CEO & Fullstack Developer</p>
            </div>
            <div className="team-member">
              <h3>Sravya</h3>
              <p>Backend Developer</p>
            </div>
            <div className="team-member">
              <h3>Sai Charan</h3>
              <p>Frontend Developer</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
