import React from "react";
import { updateMemberPermissions, removeMember } from "../../api/TeamSpaceApi";

const TeamSpaceMembers = ({ 
  spaceId, 
  members, 
  currentUserRole, 
  onClose, 
  onMembersUpdate 
}) => {
  const handleToggleView = async (memberId, currentCanView) => {
    try {
      await updateMemberPermissions(memberId, { can_view: !currentCanView });
      onMembersUpdate();
    } catch (error) {
      console.error("Error updating member permissions:", error);
      alert("Failed to update member permissions");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember(memberId);
        onMembersUpdate();
      } catch (error) {
        console.error("Error removing member:", error);
        alert("Failed to remove member");
      }
    }
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="members-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        
        <div className="members-header">
          <h3>Team Members</h3>
          <p>{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="members-list">
          {members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <div className="member-avatar">
                  {member.users?.full_name?.charAt(0) || member.users?.email?.charAt(0) || '?'}
                </div>
                <div className="member-details">
                  <h4>{member.users?.full_name || 'Unknown User'}</h4>
                  <p>{member.users?.email}</p>
                  <span className={`role-badge ${member.role}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              {isAdmin && member.role !== 'admin' && (
                <div className="member-actions">
                  <button
                    className={`toggle-view-btn ${member.can_view ? 'active' : ''}`}
                    onClick={() => handleToggleView(member.id, member.can_view)}
                  >
                    {member.can_view ? '👁️ Can View' : '🚫 No View'}
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSpaceMembers;