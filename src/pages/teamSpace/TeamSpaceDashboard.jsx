import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/db";
import {
  getTeamSpaceById,
  getTeamSpaceMembers,
  getTeamSpaceCategories,
  createTeamSpaceCategory,
  updateTeamSpaceCategory,
  deleteTeamSpaceCategory,
} from "../../api/TeamSpaceApi";
import TeamSpaceCategory from "../../components/teamSpaces/TeamSpaceCategory";
import TeamSpaceMembers from "../../components/teamSpaces/TeamSpaceMembers";
import "./teamSpaceDashboard.css";

const TeamSpaceDashboard = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [teamSpace, setTeamSpace] = useState(null);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spaceId) {
      fetchTeamSpaceData();
      setupRealtimeSubscriptions();
    }
  }, [spaceId]);

  const fetchTeamSpaceData = async () => {
    try {
      const [spaceData, categoriesData, membersData] = await Promise.all([
        getTeamSpaceById(spaceId),
        getTeamSpaceCategories(spaceId),
        getTeamSpaceMembers(spaceId),
      ]);

      setTeamSpace(spaceData);
      setCategories(categoriesData);
      setMembers(membersData);

      // Find current user's role
      const { data: userData } = await supabase.auth.getUser();
      const currentMember = membersData.find(
        (member) => member.user_id === userData.user?.id
      );
      setCurrentUserRole(currentMember?.role);
    } catch (error) {
      console.error("Error fetching team space data:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to categories changes
    const categoriesSubscription = supabase
      .channel(`team_space_categories_${spaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_space_categories",
          filter: `space_id=eq.${spaceId}`,
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    // Subscribe to members changes
    const membersSubscription = supabase
      .channel(`team_space_members_${spaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_space_members",
          filter: `space_id=eq.${spaceId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      categoriesSubscription.unsubscribe();
      membersSubscription.unsubscribe();
    };
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getTeamSpaceCategories(spaceId);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const membersData = await getTeamSpaceMembers(spaceId);
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await createTeamSpaceCategory(spaceId, categoryName);
      setCategoryName("");
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    }
  };

  const handleUpdateCategory = async (categoryId, newName) => {
    try {
      await updateTeamSpaceCategory(categoryId, newName);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteTeamSpaceCategory(categoryId);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${teamSpace.join_token}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
  };

  if (loading) {
    return <div className="loading">Loading team space...</div>;
  }

  if (!teamSpace) {
    return <div className="error">Team space not found</div>;
  }

  return (
    <div className="team-space-dashboard">
      <header className="team-space-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
          <h1>{teamSpace.name}</h1>
        </div>
        <div className="header-right">
          <button 
            className="members-btn"
            onClick={() => setShowMembersModal(true)}
          >
            👥 Members ({members.length})
          </button>
          <button 
            className="invite-btn"
            onClick={copyInviteLink}
          >
            📋 Copy Invite Link
          </button>
        </div>
      </header>

      <div className="team-space-content">
        <div className="categories-section">
          <div className="section-header">
            <h2>Categories</h2>
            <button 
              className="create-category-btn"
              onClick={() => setShowCategoryModal(true)}
            >
              + Add Category
            </button>
          </div>

          <div className="categories-grid">
            {categories.length === 0 ? (
              <div className="empty-state">
                <p>No categories yet. Create your first one!</p>
              </div>
            ) : (
              categories.map((category) => (
                <TeamSpaceCategory
                  key={category.id}
                  category={category}
                  spaceId={spaceId}
                  userRole={currentUserRole}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowCategoryModal(false)}
            >
              ✖
            </button>
            <form onSubmit={handleCreateCategory} className="modal-form">
              <h3>Create New Category</h3>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
                className="input"
              />
              <button type="submit" className="submit-btn">
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <TeamSpaceMembers
          spaceId={spaceId}
          members={members}
          currentUserRole={currentUserRole}
          onClose={() => setShowMembersModal(false)}
          onMembersUpdate={fetchMembers}
        />
      )}
    </div>
  );
};

export default TeamSpaceDashboard;