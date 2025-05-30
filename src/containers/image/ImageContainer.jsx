import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/db";
import {
  favUpdate,
  not_favUpdate,
  deleteImage,
  updateImage,
} from "../../api/ImageApi";

const ImageContainer = ({
  cat,
  onCat,
  onSubmit,
  image,
  onImage,
  description,
  onDes,
  id,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [images, setImages] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [favoriteMap, setFavoriteMap] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editURL, setEditURL] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const favHandler = async (imageId) => {
    await favUpdate(imageId);
    setFavoriteMap((prev) => ({ ...prev, [imageId]: true }));
  };

  const notFavHandler = async (imageId) => {
    await not_favUpdate(imageId);
    setFavoriteMap((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleDelete = async (imageId) => {
    await deleteImage(imageId);
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleEdit = (image) => {
    setEditImage(image);
    setEditTitle(image.title);
    setEditURL(image.image_url);
    setEditDesc(image.description);
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateImage(editImage.id, {
      title: editTitle,
      image_url: editURL,
      description: editDesc,
    });

    setImages(
      images.map((img) =>
        img.id === editImage.id
          ? { ...img, title: editTitle, image_url: editURL, description: editDesc }
          : img
      )
    );

    setEditModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: imageData, error: imageError } = await supabase
        .from("images")
        .select("id, title, image_url, description, is_favorite")
        .eq("category_id", id);

      if (imageError) console.error("Image fetch error:", imageError);
      setImages(imageData || []);

      const favMap = {};
      (imageData || []).forEach((img) => {
        favMap[img.id] = img.is_favorite;
      });
      setFavoriteMap(favMap);

      const { data: categoryData, error: catError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (catError) console.error("Category fetch error:", catError);
      setCategoryName(categoryData?.name || "Untitled Category");
    };

    fetchData();
  }, [id]);

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Images Page</div>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Add Image
        </button>
      </header>

      <h2 className="category-title">{categoryName}</h2>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form onSubmit={onSubmit} className="modal-form">
              <input
                type="text"
                value={cat}
                onChange={onCat}
                placeholder="Image Title"
                required
                className="input"
              />
              <input
                type="url"
                value={image}
                onChange={onImage}
                placeholder="Image URL"
                required
                className="input"
              />
              <textarea
                value={description}
                onChange={onDes}
                placeholder="Description"
                rows={4}
                className="textarea"
              />
              <button type="submit" className="submit-btn">
                Add Image
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
            <form onSubmit={handleEditSubmit} className="modal-form">
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
                value={editURL}
                onChange={(e) => setEditURL(e.target.value)}
                placeholder="Edit Image URL"
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

      {/* Image Grid */}
      <main className="card-grid">
        {images.map((img) => (
          <div key={img.id} className="card">
            <h3 className="card-title">{img.title}</h3>
            <img src={img.image_url} alt={img.title} className="image-preview" />
            <p className="card-desc">{img.description}</p>
            <br />
            <div className="fav">
              {favoriteMap[img.id] ? (
                <button onClick={() => notFavHandler(img.id)} className="fav">
                  ★ Favorited
                </button>
              ) : (
                <button onClick={() => favHandler(img.id)} className="fav">
                  ☆ Mark Fav
                </button>
              )}
              <div className="action">
                <button onClick={() => handleEdit(img)} className="edit">
                  ✎ edit
                </button>
                <button onClick={() => handleDelete(img.id)} className="delete">
                  🗑 delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ImageContainer;
