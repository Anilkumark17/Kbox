import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/db";
import "./notes.css";
import { deleteNote, favUpdate, not_favUpdate } from "../../api/NoteApi";

const NotesContainer = ({ category, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [favMap, setFavoriteMap] = useState({});
  const [viewNote, setViewNote] = useState(null);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("category_id", id);

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setNotes(data);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: noteTitle,
        content: noteText,
        category_id: id,
      };
      const { error } = await supabase.from("notes").insert([payload]).select();
      if (error) {
        console.error("Insert error:", error.message);
      } else {
        setNoteTitle("");
        setNoteText("");
        setShowModal(false);
        fetchNotes();
      }
    } catch (err) {
      console.error("Caught exception:", err.message);
    }
  };

  useEffect(() => {
    if (id) fetchNotes();
  }, [id]);

  const DeleteHandler = async (id) => {
    await deleteNote(id);
    window.location.reload();
  };

  const favHandler = async (id) => {
    await favUpdate(id);
    setFavoriteMap((prev) => ({ ...prev, [id]: true }));
  };

  const NotFavHanlder = async (id) => {
    await not_favUpdate(id);
    setFavoriteMap((prev) => ({ ...prev, [id]: false }));
  };

  const displayHandler = (note) => {
    setViewNote(note);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Notes Page</div>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Create
        </button>
      </header>

      <h2 className="category-title">{category}</h2>

      {/* Create Note Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form className="modal-form" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="input"
                required
              />
              <textarea
                className="textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write something important..."
                required
              />
              <button type="submit" className="submit-btn">
                Add Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Full Note Modal */}
      {viewNote && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setViewNote(null)}>
              ✖
            </button>
            <h2>{viewNote.title}</h2>
            <p>{viewNote.content}</p>
            <button
              className="edit"
              onClick={() => {
                setNoteTitle(viewNote.title);
                setNoteText(viewNote.content);
                setShowModal(true);
                setViewNote(null);
              }}
            >
              ✎ Edit Note
            </button>
          </div>
        </div>
      )}

      <main className="card-grid">
        {notes.map((item) => (
          <div key={item.id} className="card">
            <div onClick={() => displayHandler(item)}>
              <h3 className="card-title">{item.title}</h3>
              <p
                className="notes-content"
                style={{
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.content}
              </p>
            </div>
            <div className="fav-button">
              <div className="fav">
                {favMap[item.id] ? (
                  <button
                    onClick={() => NotFavHanlder(item.id)}
                    className="fav"
                  >
                    ★ Favorited
                  </button>
                ) : (
                  <button onClick={() => favHandler(item.id)} className="fav">
                    ☆ Mark Fav
                  </button>
                )}
              </div>
              <button className="delete" onClick={() => DeleteHandler(item.id)}>
                delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default NotesContainer;
