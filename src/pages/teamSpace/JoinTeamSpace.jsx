import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/db";
import { joinTeamSpaceByToken } from "../../api/TeamSpaceApi";
import "./joinTeamSpace.css";

const JoinTeamSpace = () => {
  const { joinToken } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamSpace, setTeamSpace] = useState(null);

  useEffect(() => {
    handleJoinSpace();
  }, [joinToken]);

  const handleJoinSpace = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Redirect to login with return URL
        navigate(`/auth?redirect=/join/${joinToken}`);
        return;
      }

      // Get team space info first
      const { data: spaceData, error: spaceError } = await supabase
        .from("team_spaces")
        .select("id, name")
        .eq("join_token", joinToken)
        .single();

      if (spaceError) {
        setError("Invalid or expired invite link");
        setLoading(false);
        return;
      }

      setTeamSpace(spaceData);

      // Try to join the space
      const result = await joinTeamSpaceByToken(joinToken);
      
      if (result.alreadyMember) {
        // User is already a member, redirect to space
        navigate(`/space/${result.spaceId}`);
      } else {
        // Successfully joined, show success message then redirect
        setTimeout(() => {
          navigate(`/space/${result.spaceId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error joining team space:", error);
      setError("Failed to join team space. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="join-container">
        <div className="join-card">
          <div className="loading-spinner"></div>
          <h2>Joining Team Space...</h2>
          <p>Please wait while we process your invitation.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-container">
        <div className="join-card error">
          <div className="error-icon">❌</div>
          <h2>Unable to Join</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-container">
      <div className="join-card success">
        <div className="success-icon">✅</div>
        <h2>Successfully Joined!</h2>
        <p>Welcome to <strong>{teamSpace?.name}</strong></p>
        <p>Redirecting you to the team space...</p>
        <button 
          className="continue-btn"
          onClick={() => navigate(`/space/${teamSpace?.id}`)}
        >
          Continue to Team Space
        </button>
      </div>
    </div>
  );
};

export default JoinTeamSpace;