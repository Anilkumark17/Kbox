import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TeamSpaceCategory = ({ 
  category, 
  spaceId, 
  userRole, 
  onUpdate, 
  onDelete 
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateName, setUpdateName] = useState(category.name);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    await onUpdate(category.id, updateName);
    setShowUpdateModal(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(category.id);
  };

  const openUpdateModal = (e) => {
    e.stopPropagation();
    setUpdateName(category.name);
    setShowUpdateModal(true);
  };

  return (
    <>
      <div 
        className="category-card"
        onClick={() => navigate(`/space/${spaceId}/category/${category.id}`)}
      >
        <div className="card-body">
          <span>{category.name}</span>
        </div>
        <div className="card-actions">
          <button 
            className="btn update" 
            onClick={openUpdateModal}
          >
            Update
          </button>
          <button 
            className="btn delete" 
            onClick={handleDelete}
          >
            🗑️
          </button>
        </div>
      </div>

      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowUpdateModal(false)}
            >
              ✖
            </button>
            <form onSubmit={handleUpdate} className="modal-form">
              <h3>Update Category</h3>
              <input
                type="text"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                required
                placeholder="Update category name"
                className="input"
              />
              <button type="submit" className="submit-btn">
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamSpaceCategory;