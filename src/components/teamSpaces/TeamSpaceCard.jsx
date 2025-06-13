import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/db";
import {
  getTeamSpaceLinks,
  createTeamSpaceLink,
  updateTeamSpaceLink,
  deleteTeamSpaceLink,
} from "../../api/TeamSpaceApi";

const TeamSpaceCard = ({ spaceId, categoryId, categoryName }) => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [links, setLinks] = useState([]);
  const [favoriteMap, setFavoriteMap] = useState({});
  const [editLink, setEditLink] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (categoryId) {
      fetchLinks();
      setupRealtimeSubscription();
    }
  }, [categoryId]);

  const fetchLinks = async () => {
    try {
      const linksData = await getTeamSpaceLinks(categoryId);
      setLinks(linksData);

      const favMap = {};
      linksData.forEach((link) => {
        favMap[link.id] = link.is_favorite;
      });
      setFavoriteMap(favMap);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`team_space_links_${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_space_links",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTeamSpaceLink({
        category_id: categoryId,
        title,
        url,
        description,
      });

      setTitle("");
      setUrl("");
      setDescription("");
      setShowModal(false);
      fetchLinks();
    } catch (error) {
      console.error("Error creating link:", error);
      alert("Failed to create link");
    }
  };

  const handleEditLink = (link) => {
    setEditLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDesc(link.description);
    setEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();

    try {
      await updateTeamSpaceLink(editLink.id, {
        title: editTitle,
        url: editUrl,
        description: editDesc,
      });

      setEditModal(false);
      fetchLinks();
    } catch (error) {
      console.error("Error updating link:", error);
      alert("Failed to update link");
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteTeamSpaceLink(linkId);
        fetchLinks();
      } catch (error) {
        console.error("Error deleting link:", error);
        alert("Failed to delete link");
      }
    }
  };

  const handleToggleFavorite = async (linkId) => {
    try {
      const newFavoriteStatus = !favoriteMap[linkId];
      await updateTeamSpaceLink(linkId, { is_favorite: newFavoriteStatus });
      setFavoriteMap((prev) => ({ ...prev, [linkId]: newFavoriteStatus }));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Team Links</div>
      </header>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#2a2c37",
              width: "300px",
              height: "300px",
              borderRadius: "12px",
              padding: "1.5rem 2rem",
              paddingTop: "50px",
              marginTop: "100px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
            }}
          >
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form onSubmit={handleCreateLink} className="modal-form">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Link Title"
                required
                className="input"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL"
                className="input"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={4}
                className="textarea"
              />
              <button type="submit" className="submit-btn">
                Add Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditModal(false)}>
              ✖
            </button>
            <form onSubmit={handleUpdateLink} className="modal-form">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit Title"
                required
                className="input"
              />
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="Edit URL"
                className="input"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Edit Description"
                rows={4}
                className="textarea"
              />
              <button type="submit" className="submit-btn">
                Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Links Grid */}
      <main className="card-grid">
        {links.map((item) => (
          <div key={item.id} className="card">
            <div className="card-header">
              <h3 className="card-title">{item.title}</h3>
              <div className="menu-container">
                <button
                  className="menu-btn"
                  onClick={() =>
                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                  }
                >
                  ⋮
                </button>
                {openMenuId === item.id && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => handleEditLink(item)}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleDeleteLink(item.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="card-desc">{item.description}</p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link"
              >
                Visit Link ↗
              </a>
            )}
            <div className="fav">
              <button
                onClick={() => handleToggleFavorite(item.id)}
                className="fav"
              >
                {favoriteMap[item.id] ? "★ Favorited" : "☆ Mark Fav"}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Create Button */}
      <button
        className="floating-create-btn"
        onClick={() => setShowModal(true)}
      >
        +
      </button>
    </div>
  );
};

export default TeamSpaceCard;