import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/db";
import { updateApi, categoryFetch, deleteApi } from "../../api/CategoryAPi";
import "./category.css";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [updateName, setUpdateName] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) return console.error("Error fetching user:", userError);

    const userId = userData?.user?.id;
    if (!userId) return console.warn("User ID not found");

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  };

  const openUpdateModal = async (id) => {
    const category = await categoryFetch(id);
    if (category?.length) {
      setSelectedCategoryId(id);
      setUpdateName(category[0].name);
      setShowUpdateModal(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateApi(selectedCategoryId, updateName);
    setShowUpdateModal(false);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteApi(id);
      fetchCategories();
    }
  };

  return (
    <div className="category-container">
      <h2>Your Categories</h2>

      <div className="category-grid">
        {categories.map((cat) => (
          <div className="category-card" key={cat.id}>
            <div onClick={() => navigate(`/dashboard/${cat.id}`)} className="card-body">
              <span>{cat.name}</span>
            </div>
            <div className="card-actions">
              <button className="btn update" onClick={(e) => { e.stopPropagation(); openUpdateModal(cat.id); }}>Update</button>
              <button className="btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowUpdateModal(false)}>✖</button>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                required
                placeholder="Update category name"
              />
              <button type="submit" className="btn submit">Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
