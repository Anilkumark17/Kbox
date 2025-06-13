import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserTeamSpaces, createTeamSpace } from "../../api/TeamSpaceApi";
import "./teamSpaces.css";

const TeamSpacesList = () => {
  const [teamSpaces, setTeamSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamSpaces();
  }, []);

  const fetchTeamSpaces = async () => {
    try {
      const spaces = await getUserTeamSpaces();
      setTeamSpaces(spaces);
    } catch (error) {
      console.error("Error fetching team spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!spaceName.trim()) return;

    try {
      const newSpace = await createTeamSpace(spaceName);
      setTeamSpaces([...teamSpaces, newSpace]);
      setSpaceName("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating team space:", error);
      alert("Failed to create team space");
    }
  };

  if (loading) {
    return <div className="loading">Loading team spaces...</div>;
  }

  return (
    <div className="team-spaces-container">
      <div className="team-spaces-header">
        <h2>Team Spaces</h2>
        <button 
          className="create-space-btn"
          onClick={() => setShowModal(true)}
        >
          ➕ New Team Space
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <form onSubmit={handleCreateSpace} className="modal-form">
              <h3>Create New Team Space</h3>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Enter space name"
                required
                className="input"
              />
              <button type="submit" className="submit-btn">
                Create Space
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="spaces-grid">
        {teamSpaces.length === 0 ? (
          <div className="empty-state">
            <p>No team spaces yet. Create your first one!</p>
          </div>
        ) : (
          teamSpaces.map((space) => (
            <div 
              key={space.id} 
              className="space-card"
              onClick={() => navigate(`/space/${space.id}`)}
            >
              <div className="space-header">
                <h3>{space.name}</h3>
                <span className="role-badge">
                  {space.team_space_members[0]?.role}
                </span>
              </div>
              <p className="space-meta">
                Created {new Date(space.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamSpacesList;